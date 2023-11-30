import { createId } from '@paralleldrive/cuid2'
import { orders, users } from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'

const customer1Id = createId()
const customer2Id = createId()

await db.insert(users).values([
  {
    id: customer1Id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
  {
    id: customer2Id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
])

const ordersToInsert: (typeof orders.$inferInsert)[] = []

for (let i = 0; i < 80; i++) {
  ordersToInsert.push({
    customerId: faker.helpers.arrayElement([customer1Id, customer2Id]),
    status: 'pending',
    totalInCents: faker.number.int({
      min: 2900,
      max: 7900,
    }),
    createdAt: faker.date.recent({
      days: 7,
    }),
  })
}

await db.insert(orders).values(ordersToInsert)

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
