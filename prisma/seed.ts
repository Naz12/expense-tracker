import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the demo password
  const hashedPassword = await hash('password', 12)
  
  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      image: 'https://github.com/shadcn.png',
      password: hashedPassword,
    },
  })

  // Create default expense categories
  const expenseCategories = [
    { name: 'Food & Dining', color: '#EF4444' },
    { name: 'Transportation', color: '#3B82F6' },
    { name: 'Bills & Utilities', color: '#F59E0B' },
    { name: 'Entertainment', color: '#8B5CF6' },
    { name: 'Shopping', color: '#EC4899' },
    { name: 'Health & Fitness', color: '#10B981' },
    { name: 'Education', color: '#6366F1' },
    { name: 'Other', color: '#6B7280' },
  ]

  // Create default income categories
  const incomeCategories = [
    { name: 'Salary', color: '#10B981' },
    { name: 'Business', color: '#3B82F6' },
    { name: 'Investments', color: '#8B5CF6' },
    { name: 'Freelance', color: '#F59E0B' },
    { name: 'Other', color: '#6B7280' },
  ]

  // Create expense categories
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: { 
        name_type: { 
          name: category.name, 
          type: 'EXPENSE' 
        } 
      },
      update: {},
      create: {
        name: category.name,
        type: 'EXPENSE',
        isDefault: true,
        color: category.color,
      },
    })
  }

  // Create income categories
  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: { 
        name_type: { 
          name: category.name, 
          type: 'INCOME' 
        } 
      },
      update: {},
      create: {
        name: category.name,
        type: 'INCOME',
        isDefault: true,
        color: category.color,
      },
    })
  }

  // Get some categories for demo transactions
  const foodCategory = await prisma.category.findFirst({
    where: { name: 'Food & Dining', type: 'EXPENSE' }
  })
  const salaryCategory = await prisma.category.findFirst({
    where: { name: 'Salary', type: 'INCOME' }
  })
  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transportation', type: 'EXPENSE' }
  })

  // Create some demo transactions
  if (foodCategory && salaryCategory && transportCategory) {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Demo income
    await prisma.transaction.create({
      data: {
        amount: 5000,
        description: 'Monthly Salary',
        type: 'INCOME',
        date: lastMonth,
        userId: user.id,
        categoryId: salaryCategory.id,
      },
    })

    // Demo expenses
    await prisma.transaction.createMany({
      data: [
        {
          amount: 45.50,
          description: 'Grocery Shopping',
          type: 'EXPENSE',
          date: new Date(now.getFullYear(), now.getMonth(), 1),
          userId: user.id,
          categoryId: foodCategory.id,
        },
        {
          amount: 12.30,
          description: 'Lunch at Restaurant',
          type: 'EXPENSE',
          date: new Date(now.getFullYear(), now.getMonth(), 2),
          userId: user.id,
          categoryId: foodCategory.id,
        },
        {
          amount: 25.00,
          description: 'Gas Station',
          type: 'EXPENSE',
          date: new Date(now.getFullYear(), now.getMonth(), 3),
          userId: user.id,
          categoryId: transportCategory.id,
        },
        {
          amount: 8.50,
          description: 'Coffee',
          type: 'EXPENSE',
          date: new Date(now.getFullYear(), now.getMonth(), 4),
          userId: user.id,
          categoryId: foodCategory.id,
        },
      ],
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
