'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react'
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const deleteTransaction = api.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction deleted successfully')
      onTransactionUpdate?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction.mutateAsync({ id })
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
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
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
                <p className="text-sm text-muted-foreground">
                  Create a new income or expense transaction
                </p>
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
        {transactions.length === 0 ? (
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
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
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
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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
            <p className="text-sm text-muted-foreground">
              Update your transaction details
            </p>
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
