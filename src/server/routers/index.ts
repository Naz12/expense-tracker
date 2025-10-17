import { createTRPCRouter } from '../trpc'
import { userRouter } from './user'
import { categoryRouter } from './category'
import { transactionRouter } from './transaction'
import { recurringRouter } from './recurring'

export const appRouter = createTRPCRouter({
  user: userRouter,
  category: categoryRouter,
  transaction: transactionRouter,
  recurring: recurringRouter,
})

export type AppRouter = typeof appRouter
