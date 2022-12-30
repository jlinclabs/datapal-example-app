import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

client[Symbol.for('nodejs.util.inspect.custom')] = function () {
  return 'Prisma()'
}

export default client
