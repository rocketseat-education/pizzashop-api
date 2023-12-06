import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { and, count, eq, gte, lte, sql, sum } from 'drizzle-orm'
import dayjs from 'dayjs'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'

export const getDailyReceiptInPeriod = new Elysia().use(authentication).get(
  '/metrics/daily-receipt-in-period',
  async ({ getManagedRestaurantId, query, set }) => {
    const restaurantId = await getManagedRestaurantId()

    const { from, to } = query

    const startDate = from ? dayjs(from) : dayjs().subtract(7, 'd')
    const endDate = to ? dayjs(to) : from ? startDate.add(7, 'days') : dayjs()

    if (endDate.diff(startDate, 'days') > 7) {
      set.status = 400

      return { message: 'Date interval must be a maximum of 7 days.' }
    }

    const receiptPerDay = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
        receipt: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate.startOf('day').toDate()),
          lte(orders.createdAt, endDate.endOf('day').toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)
      .having(({ receipt }) => gte(receipt, 1))

    return receiptPerDay
  },
  {
    query: t.Object({
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  },
)
