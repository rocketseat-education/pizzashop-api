import Elysia from 'elysia'
import { authentication } from '../authentication'

export const getProfile = new Elysia()
  .use(authentication)
  .get('/profile', async ({ getCurrentUser }) => {
    const { sub: userId } = await getCurrentUser()

    return `Hello ${userId}`
  })
