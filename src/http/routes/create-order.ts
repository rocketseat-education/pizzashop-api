import Elysia from 'elysia'

export const createOrder = new Elysia().post('/orders', () => {
  return 'createOrder'
})
