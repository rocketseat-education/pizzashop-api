import Elysia from 'elysia'

export const registerRestaurant = new Elysia().post('/restaurants', () => {
  return 'registerRestaurant'
})
