import Elysia from 'elysia'

export const registerCustomer = new Elysia().post('/customers', () => {
  return 'registerCustomer'
})
