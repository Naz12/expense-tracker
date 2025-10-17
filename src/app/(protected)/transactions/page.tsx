'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { TransactionList } from '@/components/expense/transaction-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TransactionForm } from '@/components/expense/transaction-form'
import { Plus, Search, Filter } from 'lucide-react'
import { api } from '@/lib/trpc-client'

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Get categories for filter
  const { data: categoriesRaw } = api.category.getCategories.useQuery({})
  
  // Handle superjson serialization wrapper
  const categories = categoriesRaw && typeof categoriesRaw === 'object' && 'json' in categoriesRaw ? categoriesRaw.json : categoriesRaw

  // Get transactions with filters
  const { data: transactionsData, refetch } = api.transaction.getTransactions.useQuery({
    limit: 50,
    search: search || undefined,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
  })

  const handleTransactionUpdate = () => {
    refetch()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Manage your income and expenses
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Create a new income or expense transaction
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                onSuccess={() => {
                  setIsAddDialogOpen(false)
                  handleTransactionUpdate()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter transactions by type, category, or search term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={(value: 'INCOME' | 'EXPENSE' | 'ALL') => setTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setTypeFilter('ALL')
                    setCategoryFilter('ALL')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {transactionsData && (
          <TransactionList
            transactions={transactionsData.transactions}
            onTransactionUpdate={handleTransactionUpdate}
          />
        )}

        {/* Load More Button */}
        {transactionsData?.nextCursor && (
          <div className="text-center">
            <Button variant="outline" onClick={() => {
              // TODO: Implement pagination
              console.log('Load more transactions')
            }}>
              Load More Transactions
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
