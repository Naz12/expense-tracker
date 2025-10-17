import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  getCategories: protectedProcedure
    .input(
      z.object({
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.type ? { type: input.type } : {}
      
      // Get default categories and user's custom categories
      const [defaultCategories, userCategories] = await Promise.all([
        ctx.db.category.findMany({
          where: { isDefault: true, ...where },
          orderBy: { name: 'asc' },
        }),
        ctx.db.category.findMany({
          where: { 
            userId: ctx.session.user.id, 
            isDefault: false,
            ...where 
          },
          orderBy: { name: 'asc' },
        }),
      ])

      return [...defaultCategories, ...userCategories]
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        type: z.enum(['INCOME', 'EXPENSE']),
        color: z.string().default('#3B82F6'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if category with same name and type already exists
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          name: input.name,
          type: input.type,
          userId: ctx.session.user.id,
        },
      })

      if (existingCategory) {
        throw new Error('Category with this name already exists')
      }

      return ctx.db.category.create({
        data: {
          name: input.name,
          type: input.type,
          color: input.color,
          userId: ctx.session.user.id,
          isDefault: false,
        },
      })
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
          isDefault: false, // Can't update default categories
        },
      })

      if (!category) {
        throw new Error('Category not found or cannot be updated')
      }

      // Check if new name conflicts with existing category
      if (input.name && input.name !== category.name) {
        const existingCategory = await ctx.db.category.findFirst({
          where: {
            name: input.name,
            type: category.type,
            userId: ctx.session.user.id,
            id: { not: input.id },
          },
        })

        if (existingCategory) {
          throw new Error('Category with this name already exists')
        }
      }

      return ctx.db.category.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.color && { color: input.color }),
        },
      })
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
          isDefault: false, // Can't delete default categories
        },
        include: {
          transactions: true,
          recurringTransactions: true,
        },
      })

      if (!category) {
        throw new Error('Category not found or cannot be deleted')
      }

      // Check if category has transactions
      if (category.transactions.length > 0 || category.recurringTransactions.length > 0) {
        throw new Error('Cannot delete category with existing transactions')
      }

      return ctx.db.category.delete({
        where: { id: input.id },
      })
    }),

  getCategoryStats: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        categoryId: input.categoryId,
        userId: ctx.session.user.id,
      }

      if (input.startDate || input.endDate) {
        where.date = {}
        if (input.startDate) where.date.gte = input.startDate
        if (input.endDate) where.date.lte = input.endDate
      }

      const transactions = await ctx.db.transaction.findMany({
        where,
        select: {
          amount: true,
          type: true,
        },
      })

      const totalAmount = transactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount)
      }, 0)

      const transactionCount = transactions.length

      return {
        totalAmount,
        transactionCount,
        transactions,
      }
    }),
})
