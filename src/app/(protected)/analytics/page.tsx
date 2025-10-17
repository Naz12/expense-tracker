'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { CategoryBreakdownChart } from '@/components/expense/category-breakdown-chart'
import { MonthlyTrendChart } from '@/components/expense/monthly-trend-chart'
import { StatsCards } from '@/components/expense/stats-cards'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { api } from '@/lib/trpc-client'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'3' | '6' | '12' | '24'>('12')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Get monthly trends
  const { data: monthlyTrends } = api.transaction.getMonthlyTrends.useQuery({
    months: parseInt(timeRange),
  })

  // Get current year stats
  const { data: currentYearStats } = api.transaction.getMonthlyStats.useQuery({
    year: selectedYear,
    month: new Date().getMonth(),
  })

  // Get previous year stats for comparison
  const { data: previousYearStats } = api.transaction.getMonthlyStats.useQuery({
    year: selectedYear - 1,
    month: new Date().getMonth(),
  })

  // Get expense breakdown for current year
  const { data: expenseBreakdown } = api.transaction.getCategoryBreakdown.useQuery({
    type: 'EXPENSE',
    startDate: new Date(selectedYear, 0, 1),
    endDate: new Date(selectedYear, 11, 31, 23, 59, 59),
  })

  // Get income breakdown for current year
  const { data: incomeBreakdown } = api.transaction.getCategoryBreakdown.useQuery({
    type: 'INCOME',
    startDate: new Date(selectedYear, 0, 1),
    endDate: new Date(selectedYear, 11, 31, 23, 59, 59),
  })

  // Calculate yearly totals
  const yearlyIncome = monthlyTrends?.reduce((sum, month) => sum + month.income, 0) || 0
  const yearlyExpenses = monthlyTrends?.reduce((sum, month) => sum + month.expenses, 0) || 0
  const yearlyNet = yearlyIncome - yearlyExpenses

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights into your financial data
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: '3' | '6' | '12' | '24') => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Yearly Summary Stats */}
        <StatsCards
          totalIncome={yearlyIncome}
          totalExpenses={yearlyExpenses}
          netIncome={yearlyNet}
          transactionCount={0} // We don't have this data easily available
          previousMonthIncome={previousYearStats?.totalIncome}
          previousMonthExpenses={previousYearStats?.totalExpenses}
        />

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Monthly Trends */}
              {monthlyTrends && (
                <MonthlyTrendChart
                  data={monthlyTrends}
                  title="Monthly Trends"
                />
              )}

              {/* Expense Breakdown */}
              {expenseBreakdown && (
                <CategoryBreakdownChart
                  data={expenseBreakdown}
                  type="EXPENSE"
                  title="Expense Breakdown"
                />
              )}
            </div>

            {/* Monthly Income vs Expenses Bar Chart */}
            {monthlyTrends && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income vs Expenses</CardTitle>
                  <CardDescription>
                    Comparison of monthly income and expenses over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="monthName" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="income" fill="#10B981" name="Income" />
                        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            {incomeBreakdown && (
              <CategoryBreakdownChart
                data={incomeBreakdown}
                type="INCOME"
                title="Income Breakdown"
              />
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {expenseBreakdown && (
              <CategoryBreakdownChart
                data={expenseBreakdown}
                type="EXPENSE"
                title="Expense Breakdown"
              />
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {monthlyTrends && (
              <MonthlyTrendChart
                data={monthlyTrends}
                title="Financial Trends"
              />
            )}

            {/* Net Income Trend */}
            {monthlyTrends && (
              <Card>
                <CardHeader>
                  <CardTitle>Net Income Trend</CardTitle>
                  <CardDescription>
                    Your net income (income - expenses) over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="monthName" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                          name="Net Income"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
