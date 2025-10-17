'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryData {
  categoryId: string
  category: {
    id: string
    name: string
    color: string
    type: string
  }
  totalAmount: number
  transactionCount: number
}

interface CategoryBreakdownChartProps {
  data: CategoryData[]
  type?: 'INCOME' | 'EXPENSE'
  title?: string
}

export function CategoryBreakdownChart({ 
  data, 
  type = 'EXPENSE', 
  title = 'Category Breakdown' 
}: CategoryBreakdownChartProps) {
  const chartData = data.map(item => ({
    name: item.category.name,
    value: item.totalAmount,
    color: item.category.color,
    count: item.transactionCount,
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-medium">{data.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-medium">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Transactions: <span className="font-medium">{data.payload.count}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {type === 'INCOME' ? 'Income' : 'Expense'} distribution by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No {type.toLowerCase()} data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {type === 'INCOME' ? 'Income' : 'Expense'} distribution by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total {type === 'INCOME' ? 'Income' : 'Expenses'}</p>
              <p className="font-semibold">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Categories</p>
              <p className="font-semibold">{chartData.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
