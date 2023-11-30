import Elysia, { t } from 'elysia'
import { orders, users } from '@/db/schema'
import { db } from '@/db/connection'
import { eq, and, ilike, desc, count } from 'drizzle-orm'
import { authentication } from '../authentication'

export const getOrders = new Elysia().use(authentication).get(
  '/orders',
  async ({ query, getCurrentUser, set }) => {
    const { pageIndex, orderNumber, customerName } = query
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const baseQuery = db
      .select()
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderNumber ? ilike(orders.id, `%${orderNumber}%`) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    const [ordersCount] = await db
      .select({ count: count() })
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
        totalCount: ordersCount.count,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderNumber: t.Optional(t.String()),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
