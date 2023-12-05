import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from './errors/unauthorized-error'

export const approveOrder = new Elysia().use(authentication).patch(
  '/orders/:id/approve',
  async ({ getCurrentUser, set, params }) => {
    const { id: orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) {
      throw new UnauthorizedError()
    }

    if (order.status !== 'pending') {
      set.status = 400

      return { message: 'Order was already approved before.' }
    }

    await db
      .update(orders)
      .set({
        status: 'processing',
      })
      .where(eq(orders.id, orderId))

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
