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
  const { data: currentMonthStats } = api.transaction.getMonthlyStats.useQuery({
    year: currentYear,
    month: currentMonth,
  })

  // Get previous month stats for comparison
  const { data: previousMonthStats } = api.transaction.getMonthlyStats.useQuery({
    year: currentMonth === 0 ? currentYear - 1 : currentYear,
    month: currentMonth === 0 ? 11 : currentMonth - 1,
  })

  // Get category breakdown for expenses
  const { data: expenseBreakdown } = api.transaction.getCategoryBreakdown.useQuery({
    type: 'EXPENSE',
    startDate: new Date(currentYear, currentMonth, 1),
    endDate: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
  })

  // Get monthly trends
  const { data: monthlyTrends } = api.transaction.getMonthlyTrends.useQuery({
    months: 6,
  })

  // Get recent transactions
  const { data: recentTransactions } = api.transaction.getRecentTransactions.useQuery({
    limit: 5,
  })

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
