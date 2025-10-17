'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.date(),
  categoryId: z.string()
    .min(1, 'Category is required')
    .refine((val) => !['loading', 'error', 'no-categories'].includes(val), {
      message: 'Please select a valid category'
    }),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSuccess?: () => void
  initialData?: Partial<TransactionFormData>
  transactionId?: string
}

export function TransactionForm({ onSuccess, initialData, transactionId }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>(
    initialData?.type || 'EXPENSE'
  )

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      type: initialData?.type || 'EXPENSE',
      date: initialData?.date || new Date(),
      categoryId: initialData?.categoryId || '',
    },
  })

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = api.category.getCategories.useQuery({
    type: selectedType,
  })

  const createTransaction = api.transaction.createTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction created successfully')
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateTransaction = api.transaction.updateTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction updated successfully')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    // Prevent submission with placeholder values
    if (data.categoryId === 'loading' || data.categoryId === 'error' || data.categoryId === 'no-categories') {
      toast.error('Please select a valid category')
      return
    }
    
    setIsSubmitting(true)
    try {
      // Ensure date is properly formatted
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date : new Date(data.date),
      }
      
      if (transactionId) {
        await updateTransaction.mutateAsync({
          id: transactionId,
          ...formattedData,
        })
      } else {
        await createTransaction.mutateAsync(formattedData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDate = watch('date')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {transactionId ? 'Edit Transaction' : 'Add Transaction'}
        </CardTitle>
        <CardDescription>
          {transactionId ? 'Update your transaction details' : 'Record a new income or expense'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedType === 'EXPENSE' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('EXPENSE')
                  setValue('type', 'EXPENSE')
                  setValue('categoryId', '') // Reset category when type changes
                }}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Expense
              </Button>
              <Button
                type="button"
                variant={selectedType === 'INCOME' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('INCOME')
                  setValue('type', 'INCOME')
                  setValue('categoryId', '') // Reset category when type changes
                }}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
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
              key={selectedType} // Force re-render when type changes
              value={watch('categoryId')}
              onValueChange={(value) => setValue('categoryId', value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categoriesError ? (
                  <SelectItem value="error" disabled>
                    Error loading categories
                  </SelectItem>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message || 'Please select a category'}
              </p>
            )}
            {categoriesError && (
              <p className="text-sm text-destructive">Failed to load categories. Please try again.</p>
            )}
            {!categoriesLoading && !categoriesError && categories && categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories available for {selectedType.toLowerCase()} transactions.</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : transactionId ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
