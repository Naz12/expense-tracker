'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'
import { TransactionForm } from './transaction-form'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  date: Date
  category: {
    id: string
    name: string
    color: string
    type: string
  }
}

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdate?: () => void
  showAddButton?: boolean
}

export function TransactionList({ transactions, onTransactionUpdate, showAddButton = false }: TransactionListProps) {
  // Handle superjson serialization wrapper
  const actualTransactions = transactions && typeof transactions === 'object' && 'json' in transactions ? transactions.json : transactions
  
  if (!Array.isArray(actualTransactions)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Error: Invalid data format</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)

  const utils = api.useUtils()
  
  const deleteTransaction = api.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction deleted successfully')
      // Invalidate and refetch all transaction-related queries
      utils.transaction.getTransactions.invalidate()
      utils.transaction.getRecentTransactions.invalidate()
      utils.transaction.getMonthlyStats.invalidate()
      utils.transaction.getCategoryBreakdown.invalidate()
      utils.transaction.getMonthlyTrends.invalidate()
      onTransactionUpdate?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setDeletingTransactionId(id)
      try {
        await deleteTransaction.mutateAsync({ id })
      } finally {
        setDeletingTransactionId(null)
      }
    }
  }

  const formatAmount = (amount: number, type: 'INCOME' | 'EXPENSE') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

    return type === 'INCOME' ? `+${formatted}` : `-${formatted}`
  }

  const getAmountColor = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {actualTransactions.length} transaction{actualTransactions.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        {showAddButton && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
                  onTransactionUpdate?.()
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {actualTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found</p>
            {showAddButton && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first transaction
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {actualTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 ${
                  deletingTransactionId === transaction.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: transaction.category.color }}
                  />
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category.name}
                      </Badge>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction.id)}
                        className="text-destructive"
                        disabled={deletingTransactionId === transaction.id}
                      >
                        {deletingTransactionId === transaction.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update your transaction details
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transactionId={editingTransaction.id}
              initialData={{
                amount: editingTransaction.amount,
                description: editingTransaction.description,
                type: editingTransaction.type,
                date: new Date(editingTransaction.date),
                categoryId: editingTransaction.category.id,
              }}
              onSuccess={() => {
                setEditingTransaction(null)
                onTransactionUpdate?.()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
