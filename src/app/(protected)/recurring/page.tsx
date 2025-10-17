'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, MoreHorizontal, Edit, Trash2, CalendarIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const recurringSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  type: z.enum(['INCOME', 'EXPENSE']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.date(),
  endDate: z.date().optional(),
  categoryId: z.string().min(1, 'Category is required'),
})

type RecurringFormData = z.infer<typeof recurringSchema>

export default function RecurringPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')

  const { data: recurringTransactions, refetch } = api.recurring.getRecurringTransactions.useQuery({})
  const { data: categoriesRaw } = api.category.getCategories.useQuery({
    type: selectedType,
  })

  // Handle superjson serialization wrapper
  const categories = categoriesRaw && typeof categoriesRaw === 'object' && 'json' in categoriesRaw ? categoriesRaw.json : categoriesRaw

  const createRecurring = api.recurring.createRecurring.useMutation({
    onSuccess: () => {
      toast.success('Recurring transaction created successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateRecurring = api.recurring.updateRecurring.useMutation({
    onSuccess: () => {
      toast.success('Recurring transaction updated successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteRecurring = api.recurring.deleteRecurring.useMutation({
    onSuccess: () => {
      toast.success('Recurring transaction deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const toggleActive = api.recurring.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('Recurring transaction status updated')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      amount: 0,
      description: '',
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: new Date(),
      categoryId: '',
    },
  })

  const onSubmit = async (data: RecurringFormData) => {
    if (editingRecurring) {
      await updateRecurring.mutateAsync({
        id: editingRecurring.id,
        ...data,
      })
      setEditingRecurring(null)
    } else {
      await createRecurring.mutateAsync(data)
    }
    reset()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction?')) {
      await deleteRecurring.mutateAsync({ id })
    }
  }

  const handleToggleActive = async (id: string) => {
    await toggleActive.mutateAsync({ id })
  }

  const handleEdit = (recurring: any) => {
    setEditingRecurring(recurring)
    setValue('amount', recurring.amount)
    setValue('description', recurring.description)
    setValue('type', recurring.type)
    setValue('frequency', recurring.frequency)
    setValue('startDate', new Date(recurring.startDate))
    setValue('endDate', recurring.endDate ? new Date(recurring.endDate) : undefined)
    setValue('categoryId', recurring.categoryId)
    setSelectedType(recurring.type)
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

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'Daily'
      case 'WEEKLY': return 'Weekly'
      case 'MONTHLY': return 'Monthly'
      case 'YEARLY': return 'Yearly'
      default: return frequency
    }
  }

  const selectedStartDate = watch('startDate')
  const selectedEndDate = watch('endDate')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
            <p className="text-muted-foreground">
              Manage your recurring income and expenses
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
                <DialogDescription>
                  Create a new recurring income or expense transaction
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={selectedType === 'EXPENSE' ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedType('EXPENSE')
                        setValue('type', 'EXPENSE')
                      }}
                      className="flex-1"
                    >
                      Expense
                    </Button>
                    <Button
                      type="button"
                      variant={selectedType === 'INCOME' ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedType('INCOME')
                        setValue('type', 'INCOME')
                      }}
                      className="flex-1"
                    >
                      Income
                    </Button>
                  </div>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watch('categoryId')}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={watch('frequency')}
                    onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY') => setValue('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequency && (
                    <p className="text-sm text-destructive">{errors.frequency.message}</p>
                  )}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedStartDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedStartDate ? format(selectedStartDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedStartDate}
                        onSelect={(date) => date && setValue('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date (Optional) */}
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedEndDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedEndDate ? format(selectedEndDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedEndDate}
                        onSelect={(date) => setValue('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingRecurring ? 'Update Recurring Transaction' : 'Create Recurring Transaction'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingRecurring(null)
                      reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recurring Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring Transactions</CardTitle>
            <CardDescription>
              {recurringTransactions?.length || 0} recurring transaction{(recurringTransactions?.length || 0) !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!recurringTransactions || recurringTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recurring transactions found</p>
                <p className="text-sm">Create your first recurring transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recurringTransactions.map((recurring) => (
                  <div
                    key={recurring.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: recurring.category.color }}
                      />
                      <div>
                        <p className="font-medium">{recurring.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {recurring.category.name}
                          </Badge>
                          <span>•</span>
                          <span>{getFrequencyLabel(recurring.frequency)}</span>
                          <span>•</span>
                          <span>Next: {format(new Date(recurring.nextOccurrence), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${getAmountColor(recurring.type)}`}>
                        {formatAmount(recurring.amount, recurring.type)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(recurring.id)}
                      >
                        {recurring.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(recurring)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(recurring.id)}
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
        </Card>
      </div>
    </MainLayout>
  )
}
