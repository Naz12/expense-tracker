#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupDuplicates() {
  try {
    console.log('🔍 Checking for duplicate transactions...')
    
    // Find duplicate transactions (same user, amount, description, date, and category)
    const duplicates = await prisma.$queryRaw`
      SELECT 
        "userId",
        amount,
        description,
        date,
        "categoryId",
        type,
        COUNT(*) as count
      FROM "Transaction"
      GROUP BY "userId", amount, description, date, "categoryId", type
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate transactions found!')
      return
    }
    
    console.log(`❌ Found ${duplicates.length} groups of duplicate transactions:`)
    
    for (const duplicate of duplicates) {
      console.log(`\n📊 Duplicate group:`)
      console.log(`   User: ${duplicate.userId}`)
      console.log(`   Amount: $${duplicate.amount}`)
      console.log(`   Description: ${duplicate.description}`)
      console.log(`   Date: ${duplicate.date}`)
      console.log(`   Type: ${duplicate.type}`)
      console.log(`   Count: ${duplicate.count}`)
      
      // Get all transactions in this duplicate group
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: duplicate.userId,
          amount: duplicate.amount,
          description: duplicate.description,
          date: duplicate.date,
          categoryId: duplicate.categoryId,
          type: duplicate.type,
        },
        orderBy: { createdAt: 'asc' }
      })
      
      // Keep the first one, delete the rest
      const toDelete = transactions.slice(1)
      
      if (toDelete.length > 0) {
        console.log(`   🗑️  Deleting ${toDelete.length} duplicate(s)...`)
        
        for (const transaction of toDelete) {
          await prisma.transaction.delete({
            where: { id: transaction.id }
          })
          console.log(`   ✅ Deleted transaction ${transaction.id}`)
        }
      }
    }
    
    console.log('\n🎉 Cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicates()
