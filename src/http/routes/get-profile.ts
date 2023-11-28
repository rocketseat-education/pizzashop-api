import Elysia from 'elysia'
import { authentication } from '../authentication'

export const getProfile = new Elysia()
  .use(authentication)
  .get('/profile', async ({ jwt, set, cookie: { auth } }) => {
    const profile = await jwt.verify(auth)

    if (!profile) {
      set.status = 401
      return 'Unauthorized'
    }

    return `Hello ${profile.name}`
  })
