const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  const email = process.env.TEST_USER_EMAIL || 'testuser-09f4790a77e5cd48@example.com'
  const password = process.env.TEST_USER_PASSWORD || 'c026d617f40fca2e703f06de'

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Test user already exists:', email)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: hashedPassword
      }
    })

    console.log('Test user created successfully:', email)
    console.log('User ID:', user.id)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()