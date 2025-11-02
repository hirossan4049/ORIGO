const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testLogin() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db'
      }
    }
  })

  try {
    const email = 'testuser-09f4790a77e5cd48@example.com'
    const password = 'c026d617f40fca2e703f06de'

    console.log('Testing login with:')
    console.log('Email:', email)
    console.log('Password:', password)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', user.email)
    console.log('User ID:', user.id)

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (isPasswordValid) {
      console.log('✅ Password is valid')
    } else {
      console.log('❌ Password is invalid')
    }

  } catch (error) {
    console.error('Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()