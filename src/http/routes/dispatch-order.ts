import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from './errors/unauthorized-error'

export const dispatchOrder = new Elysia().use(authentication).patch(
  '/orders/:id/dispatch',
  async ({ getManagedRestaurantId, set, params }) => {
    const { id: orderId } = params
    const restaurantId = await getManagedRestaurantId()

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

    if (order.status !== 'processing') {
      set.status = 400

      return { message: 'O pedido já foi enviado ao cliente.' }
    }

    await db
      .update(orders)
      .set({
        status: 'delivering',
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
