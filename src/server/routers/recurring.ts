import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const recurringRouter = createTRPCRouter({
  getRecurringTransactions: protectedProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.session.user.id,
      }

      if (input.isActive !== undefined) {
        where.isActive = input.isActive
      }

      return ctx.db.recurringTransaction.findMany({
        where,
        orderBy: { nextOccurrence: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true,
            },
          },
        },
      })
    }),

  createRecurring: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1).max(255),
        type: z.enum(['INCOME', 'EXPENSE']),
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
        startDate: z.string().transform((str) => new Date(str)).or(z.date()),
        endDate: z.string().transform((str) => new Date(str)).or(z.date()).optional(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify category exists and belongs to user or is default
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          OR: [
            { userId: ctx.session.user.id },
            { isDefault: true },
          ],
        },
      })

      if (!category) {
        throw new Error('Category not found')
      }

      // Calculate next occurrence
      const nextOccurrence = calculateNextOccurrence(input.startDate, input.frequency)

      return ctx.db.recurringTransaction.create({
        data: {
          amount: input.amount,
          description: input.description,
          type: input.type,
          frequency: input.frequency,
          startDate: input.startDate,
          endDate: input.endDate,
          nextOccurrence,
          userId: ctx.session.user.id,
          categoryId: input.categoryId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true,
            },
          },
        },
      })
    }),

  updateRecurring: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).max(255).optional(),
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        categoryId: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify recurring transaction belongs to user
      const recurring = await ctx.db.recurringTransaction.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      })

      if (!recurring) {
        throw new Error('Recurring transaction not found')
      }

      // If updating category, verify it exists
      if (updateData.categoryId) {
        const category = await ctx.db.category.findFirst({
          where: {
            id: updateData.categoryId,
            OR: [
              { userId: ctx.session.user.id },
              { isDefault: true },
            ],
          },
        })

        if (!category) {
          throw new Error('Category not found')
        }
      }

      // Recalculate next occurrence if frequency or start date changed
      let nextOccurrence = recurring.nextOccurrence
      if (updateData.frequency || updateData.startDate) {
        const startDate = updateData.startDate || recurring.startDate
        const frequency = updateData.frequency || recurring.frequency
        nextOccurrence = calculateNextOccurrence(startDate, frequency)
      }

      return ctx.db.recurringTransaction.update({
        where: { id },
        data: {
          ...updateData,
          nextOccurrence,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true,
            },
          },
        },
      })
    }),

  deleteRecurring: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify recurring transaction belongs to user
      const recurring = await ctx.db.recurringTransaction.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!recurring) {
        throw new Error('Recurring transaction not found')
      }

      return ctx.db.recurringTransaction.delete({
        where: { id: input.id },
      })
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify recurring transaction belongs to user
      const recurring = await ctx.db.recurringTransaction.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!recurring) {
        throw new Error('Recurring transaction not found')
      }

      return ctx.db.recurringTransaction.update({
        where: { id: input.id },
        data: {
          isActive: !recurring.isActive,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true,
            },
          },
        },
      })
    }),

  processRecurring: protectedProcedure
    .input(z.object({ date: z.date().optional() }))
    .mutation(async ({ ctx, input }) => {
      const processDate = input.date || new Date()
      const startOfDay = new Date(processDate.getFullYear(), processDate.getMonth(), processDate.getDate())
      const endOfDay = new Date(processDate.getFullYear(), processDate.getMonth(), processDate.getDate(), 23, 59, 59)

      // Find recurring transactions that should be processed today
      const recurringTransactions = await ctx.db.recurringTransaction.findMany({
        where: {
          userId: ctx.session.user.id,
          isActive: true,
          nextOccurrence: {
            gte: startOfDay,
            lte: endOfDay,
          },
          OR: [
            { endDate: null },
            { endDate: { gte: processDate } },
          ],
        },
        include: {
          category: true,
        },
      })

      const createdTransactions = []

      for (const recurring of recurringTransactions) {
        // Check if transaction already exists for this date
        const existingTransaction = await ctx.db.transaction.findFirst({
          where: {
            userId: ctx.session.user.id,
            description: recurring.description,
            amount: recurring.amount,
            type: recurring.type,
            categoryId: recurring.categoryId,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        })

        if (!existingTransaction) {
          // Create the transaction
          const transaction = await ctx.db.transaction.create({
            data: {
              amount: recurring.amount,
              description: recurring.description,
              type: recurring.type,
              date: processDate,
              userId: ctx.session.user.id,
              categoryId: recurring.categoryId,
            },
          })

          createdTransactions.push(transaction)
        }

        // Update next occurrence
        const nextOccurrence = calculateNextOccurrence(recurring.nextOccurrence, recurring.frequency)
        
        await ctx.db.recurringTransaction.update({
          where: { id: recurring.id },
          data: { nextOccurrence },
        })
      }

      return {
        processed: recurringTransactions.length,
        created: createdTransactions.length,
        transactions: createdTransactions,
      }
    }),
})

// Helper function to calculate next occurrence
function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate)

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1)
      break
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      break
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}
