import Elysia from 'elysia'
import { orders, users } from '@/db/schema'
import { db } from '@/db/connection'
import { eq, and, ilike, sql, desc } from 'drizzle-orm'
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
      count,
    })
    .from(baseQuery.as('baseQuery'))

  const allOrders = await baseQuery
    .offset(pageIndex * 10)
    .limit(10)
    .orderBy(desc(orders.createdAt))
    .leftJoin(users, eq(orders.customerId, users.id))
    .groupBy(orders.id)

  return {
    orders: allOrders,
    meta: {
      pageIndex,
      totalCount: ordersCount[0].count,
    },
  }
})
