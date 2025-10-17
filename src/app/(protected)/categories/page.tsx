'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Edit, Trash2, Palette } from 'lucide-react'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().default('#3B82F6'),
})

type CategoryFormData = z.infer<typeof categorySchema>

const predefinedColors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
]

export default function CategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE' | 'ALL'>('ALL')

  const { data: categoriesRaw, refetch } = api.category.getCategories.useQuery({
    type: selectedType === 'ALL' ? undefined : selectedType,
  })

  // Handle superjson serialization wrapper
  const categories = categoriesRaw && typeof categoriesRaw === 'object' && 'json' in categoriesRaw ? categoriesRaw.json : categoriesRaw

  const createCategory = api.category.createCategory.useMutation({
    onSuccess: () => {
      toast.success('Category created successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateCategory = api.category.updateCategory.useMutation({
    onSuccess: () => {
      toast.success('Category updated successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteCategory = api.category.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      color: '#3B82F6',
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...data,
        })
        setEditingCategory(null)
      } else {
        await createCategory.mutateAsync(data)
      }
      reset()
      setIsAddDialogOpen(false)
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Category submission error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      await deleteCategory.mutateAsync({ id })
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setValue('name', category.name)
    setValue('type', category.type)
    setValue('color', category.color)
  }

  const defaultCategories = categories?.filter(cat => cat.isDefault) || []
  const customCategories = categories?.filter(cat => !cat.isDefault) || []

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Manage your income and expense categories
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your transactions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Category name"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value: 'INCOME' | 'EXPENSE') => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-10 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          watch('color') === color ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setValue('color', color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingCategory(null)
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

        {/* Type Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedType} onValueChange={(value: 'INCOME' | 'EXPENSE' | 'ALL') => setSelectedType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="INCOME">Income Categories</SelectItem>
                <SelectItem value="EXPENSE">Expense Categories</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Default Categories */}
        {defaultCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Default Categories</CardTitle>
              <CardDescription>
                These categories are provided by default and cannot be edited or deleted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {defaultCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {category.type}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Categories</CardTitle>
            <CardDescription>
              Your personal categories that you can edit and delete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No custom categories yet</p>
                <p className="text-sm">Create your first custom category to get started</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {customCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {category.type}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
