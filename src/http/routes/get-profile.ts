import Elysia from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'

export const getProfile = new Elysia()
  .use(authentication)
  .get('/profile', async ({ getCurrentUser }) => {
    const { sub: userId } = await getCurrentUser()

    const user = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new Error('User not found.')
    }

    return user
  })
