import Elysia from 'elysia'
import { authentication } from '../authentication'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import dayjs from 'dayjs'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'

export const getMonthCanceledOrdersAmount = new Elysia()
  .use(authentication)
  .get(
    '/metrics/month-canceled-orders-amount',
    async ({ getManagedRestaurantId }) => {
      const restaurantId = await getManagedRestaurantId()

      const today = dayjs()
      const lastMonth = today.subtract(1, 'month')
      const startOfLastMonth = lastMonth.startOf('month')

      /**
       * January is ZERO, that's why we need to sum 1 to get the actual month
       */
      const lastMonthWithYear = lastMonth.format('YYYY-MM')
      const currentMonthWithYear = today.format('YYYY-MM')

      const ordersPerMonth = await db
        .select({
          monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          amount: count(orders.id),
        })
        .from(orders)
        .where(
          and(
            eq(orders.restaurantId, restaurantId),
            eq(orders.status, 'canceled'),
            gte(orders.createdAt, startOfLastMonth.toDate()),
          ),
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
        .having(({ amount }) => gte(amount, 1))

      const currentMonthOrdersAmount = ordersPerMonth.find((ordersInMonth) => {
        return ordersInMonth.monthWithYear === currentMonthWithYear
      })

      const lastMonthOrdersAmount = ordersPerMonth.find((ordersInMonth) => {
        return ordersInMonth.monthWithYear === lastMonthWithYear
      })

      const diffFromLastMonth =
        lastMonthOrdersAmount && currentMonthOrdersAmount
          ? (currentMonthOrdersAmount.amount * 100) /
            lastMonthOrdersAmount.amount
          : null

      return {
        amount: currentMonthOrdersAmount?.amount ?? 0,
        diffFromLastMonth: diffFromLastMonth
          ? Number((diffFromLastMonth - 100).toFixed(2))
          : 0,
      }
    },
  )
