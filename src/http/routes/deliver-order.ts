import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from './errors/unauthorized-error'

export const deliverOrder = new Elysia().use(authentication).patch(
  '/orders/:id/deliver',
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

    if (order.status !== 'delivering') {
      set.status = 400

      return { message: 'O pedido já foi entregue.' }
    }

    await db
      .update(orders)
      .set({
        status: 'delivered',
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
