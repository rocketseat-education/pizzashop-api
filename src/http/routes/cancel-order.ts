import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const cancelOrder = new Elysia().use(authentication).patch(
  '/orders/:id/cancel',
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
      set.status = 401

      throw new Error('Order not found under the user managed restaurant.')
    }

    if (!['pending', 'processing'].includes(order.status)) {
      set.status = 400

      return {
        code: 'STATUS_NOT_VALID',
        message: 'O pedido não pode ser cancelado depois de ser enviado.',
      }
    }

    await db
      .update(orders)
      .set({
        status: 'canceled',
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
