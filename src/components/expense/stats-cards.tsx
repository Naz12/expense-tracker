'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionCount: number
  previousMonthIncome?: number
  previousMonthExpenses?: number
}

export function StatsCards({
  totalIncome,
  totalExpenses,
  netIncome,
  transactionCount,
  previousMonthIncome = 0,
  previousMonthExpenses = 0,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const incomeChange = calculatePercentageChange(totalIncome, previousMonthIncome)
  const expenseChange = calculatePercentageChange(totalExpenses, previousMonthExpenses)

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight
  }

  const ChangeIcon = getChangeIcon(incomeChange)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          {previousMonthIncome > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <ChangeIcon className={`h-3 w-3 mr-1 ${getChangeColor(incomeChange)}`} />
              <span className={getChangeColor(incomeChange)}>
                {Math.abs(incomeChange).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          {previousMonthExpenses > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <ChangeIcon className={`h-3 w-3 mr-1 ${getChangeColor(expenseChange)}`} />
              <span className={getChangeColor(expenseChange)}>
                {Math.abs(expenseChange).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netIncome)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Badge variant={netIncome >= 0 ? 'default' : 'destructive'} className="text-xs">
              {netIncome >= 0 ? 'Profit' : 'Loss'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactionCount}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
