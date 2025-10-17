'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { StatsCards } from '@/components/expense/stats-cards'
import { CategoryBreakdownChart } from '@/components/expense/category-breakdown-chart'
import { MonthlyTrendChart } from '@/components/expense/monthly-trend-chart'
import { TransactionList } from '@/components/expense/transaction-list'
import { api } from '@/lib/trpc-client'

export default function DashboardPage() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get current month stats
  const { data: currentMonthStatsRaw } = api.transaction.getMonthlyStats.useQuery({
    year: currentYear,
    month: currentMonth,
  })

  // Get previous month stats for comparison
  const { data: previousMonthStatsRaw } = api.transaction.getMonthlyStats.useQuery({
    year: currentMonth === 0 ? currentYear - 1 : currentYear,
    month: currentMonth === 0 ? 11 : currentMonth - 1,
  })

  // Handle superjson serialization wrapper
  const currentMonthStats = currentMonthStatsRaw && typeof currentMonthStatsRaw === 'object' && 'json' in currentMonthStatsRaw ? currentMonthStatsRaw.json : currentMonthStatsRaw
  const previousMonthStats = previousMonthStatsRaw && typeof previousMonthStatsRaw === 'object' && 'json' in previousMonthStatsRaw ? previousMonthStatsRaw.json : previousMonthStatsRaw

  // Get category breakdown for expenses
  const { data: expenseBreakdownRaw } = api.transaction.getCategoryBreakdown.useQuery({
    type: 'EXPENSE',
  })

  // Get monthly trends
  const { data: monthlyTrendsRaw } = api.transaction.getMonthlyTrends.useQuery({
    months: 6,
  })

  // Get recent transactions
  const { data: recentTransactionsRaw } = api.transaction.getRecentTransactions.useQuery({
    limit: 5,
  })

  // Handle superjson serialization wrapper for other data
  const expenseBreakdown = expenseBreakdownRaw && typeof expenseBreakdownRaw === 'object' && 'json' in expenseBreakdownRaw ? expenseBreakdownRaw.json : expenseBreakdownRaw
  const monthlyTrends = monthlyTrendsRaw && typeof monthlyTrendsRaw === 'object' && 'json' in monthlyTrendsRaw ? monthlyTrendsRaw.json : monthlyTrendsRaw
  const recentTransactions = recentTransactionsRaw && typeof recentTransactionsRaw === 'object' && 'json' in recentTransactionsRaw ? recentTransactionsRaw.json : recentTransactionsRaw

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>

        {/* Stats Cards */}
        {currentMonthStats && (
          <StatsCards
            totalIncome={currentMonthStats.totalIncome}
            totalExpenses={currentMonthStats.totalExpenses}
            netIncome={currentMonthStats.netIncome}
            transactionCount={currentMonthStats.totalTransactions}
            previousMonthIncome={previousMonthStats?.totalIncome}
            previousMonthExpenses={previousMonthStats?.totalExpenses}
          />
        )}

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Category Breakdown */}
          {expenseBreakdown && (
            <CategoryBreakdownChart
              data={expenseBreakdown}
              type="EXPENSE"
              title="Expense Breakdown"
            />
          )}

          {/* Monthly Trends */}
          {monthlyTrends && (
            <MonthlyTrendChart
              data={monthlyTrends}
              title="Monthly Trends"
            />
          )}
        </div>

        {/* Recent Transactions */}
        {recentTransactions && (
          <TransactionList
            transactions={recentTransactions}
            showAddButton={true}
          />
        )}
      </div>
    </MainLayout>
  )
}
