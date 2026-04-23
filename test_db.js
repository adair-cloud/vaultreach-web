require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'adair@vaultreach.ai' }})
  console.log(user)
}
main()
