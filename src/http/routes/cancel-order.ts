import Elysia from 'elysia'

export const cancelOrder = new Elysia().patch('/orders/:id/cancel', () => {
  return 'cancelOrder'
})
