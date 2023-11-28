import Elysia from 'elysia'

export const updateProfile = new Elysia().put('/profile', () => {
  return 'updateProfile'
})
