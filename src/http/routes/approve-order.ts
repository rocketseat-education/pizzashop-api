import Elysia from 'elysia'

export const approveOrder = new Elysia().patch('/orders/:id/approve', () => {
  return 'approveOrder'
})
