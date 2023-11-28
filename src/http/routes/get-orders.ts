import Elysia from 'elysia'
import { orders, users } from '@/db/schema'
import { db } from '@/lib/db'
import { eq, and, ilike, sql } from 'drizzle-orm'
import { z } from 'zod'

export const getOrders = new Elysia().get('/orders', async ({ query }) => {
  const { pageIndex, orderNumber, customerName } = z
    .object({
      pageIndex: z.coerce.number().default(0),
      orderNumber: z.string().optional().default(''),
      customerName: z.string().optional().default(''),
    })
    .parse(query)

  const baseQuery = db
    .select()
    .from(orders)
    .innerJoin(users, eq(users.id, orders.customerId))
    .where(
      and(
        orderNumber ? ilike(orders.id, `%${orderNumber}%`) : undefined,
        customerName ? ilike(users.name, `%${customerName}%`) : undefined,
      ),
    )

  const ordersCount = await db
    .select({
      count: sql<number>`cast(count(*) as int)`.as('count'),
    })
    .from(baseQuery.as('baseQuery'))

  const allOrders = await baseQuery.offset(pageIndex * 10).limit(10)

  return {
    orders: allOrders,
    meta: {
      pageIndex,
      totalCount: ordersCount[0].count,
    },
  }
})
