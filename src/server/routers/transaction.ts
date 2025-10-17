import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const transactionRouter = createTRPCRouter({
  getTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        categoryId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 50, cursor, type, categoryId, startDate, endDate, search } = input || {}

      const where: any = {
        userId: ctx.session.user.id,
      }

      if (type) where.type = type
      if (categoryId) where.categoryId = categoryId
      if (startDate || endDate) {
        where.date = {}
        if (startDate) where.date.gte = startDate
        if (endDate) where.date.lte = endDate
      }
      if (search) {
        where.description = {
          contains: search,
          mode: 'insensitive',
        }
      }

      const transactions = await ctx.db.transaction.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { date: 'desc' },
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

      let nextCursor: typeof cursor | undefined = undefined
      if (transactions.length > limit) {
        const nextItem = transactions.pop()
        nextCursor = nextItem!.id
      }

      return {
        transactions,
        nextCursor,
      }
    }),

  createTransaction: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1).max(255),
        type: z.enum(['INCOME', 'EXPENSE']),
        date: z.string().transform((str) => new Date(str)).or(z.date()),
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

      return ctx.db.transaction.create({
        data: {
          amount: input.amount,
          description: input.description,
          type: input.type,
          date: input.date,
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

  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).max(255).optional(),
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        date: z.string().transform((str) => new Date(str)).or(z.date()).optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify transaction belongs to user
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
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

      return ctx.db.transaction.update({
        where: { id },
        data: updateData,
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

  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify transaction belongs to user
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      return ctx.db.transaction.delete({
        where: { id: input.id },
      })
    }),

  getMonthlyStats: protectedProcedure
    .input(
      z.object({
        year: z.number().default(new Date().getFullYear()),
        month: z.number().min(0).max(11).default(new Date().getMonth()),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const year = input?.year ?? new Date().getFullYear()
      const month = input?.month ?? new Date().getMonth()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59)

      const [income, expenses] = await Promise.all([
        ctx.db.transaction.aggregate({
          where: {
            userId: ctx.session.user.id,
            type: 'INCOME',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        }),
        ctx.db.transaction.aggregate({
          where: {
            userId: ctx.session.user.id,
            type: 'EXPENSE',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        }),
      ])

      const totalIncome = Number(income._sum.amount || 0)
      const totalExpenses = Number(expenses._sum.amount || 0)
      const netIncome = totalIncome - totalExpenses

      return {
        totalIncome,
        totalExpenses,
        netIncome,
        incomeCount: income._count.id,
        expenseCount: expenses._count.id,
        totalTransactions: income._count.id + expenses._count.id,
      }
    }),

  getCategoryBreakdown: protectedProcedure
    .input(
      z.object({
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {

      const where: any = {
        userId: ctx.session.user.id,
      }

      if (input?.type) where.type = input.type
      if (input?.startDate || input?.endDate) {
        where.date = {}
        if (input.startDate) where.date.gte = input.startDate
        if (input.endDate) where.date.lte = input.endDate
      }

      const breakdown = await ctx.db.transaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      })

      // Get category details
      const categoryIds = breakdown.map(item => item.categoryId)
      const categories = await ctx.db.category.findMany({
        where: {
          id: { in: categoryIds },
        },
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        },
      })

      const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

      const result = breakdown.map(item => ({
        categoryId: item.categoryId,
        category: categoryMap.get(item.categoryId),
        totalAmount: Number(item._sum.amount || 0),
        transactionCount: item._count.id,
      })).filter(item => item.category) // Filter out categories that might have been deleted


      return result
    }),

  getMonthlyTrends: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(24).default(12),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const trends = []
      const now = new Date()
      const months = input?.months ?? 12

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

        const [income, expenses] = await Promise.all([
          ctx.db.transaction.aggregate({
            where: {
              userId: ctx.session.user.id,
              type: 'INCOME',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.transaction.aggregate({
            where: {
              userId: ctx.session.user.id,
              type: 'EXPENSE',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          }),
        ])

        trends.push({
          month: date.getMonth(),
          year: date.getFullYear(),
          monthName: date.toLocaleString('default', { month: 'short' }),
          income: Number(income._sum.amount || 0),
          expenses: Number(expenses._sum.amount || 0),
          net: Number(income._sum.amount || 0) - Number(expenses._sum.amount || 0),
        })
      }

      return trends
    }),

  getRecentTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10
      return ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: limit,
        orderBy: { date: 'desc' },
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
})
