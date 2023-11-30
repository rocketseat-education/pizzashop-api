import Elysia, { Static, t } from 'elysia'
import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import { env } from '@/env'
// import { db } from '@/lib/db'

const jwtPayloadSchema = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const authentication = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayloadSchema,
    }),
  )
  .use(cookie())
  .derive(({ jwt, cookie: { auth }, setCookie, set }) => {
    return {
      getCurrentUser: async () => {
        const payload = await jwt.verify(auth)

        if (!payload) {
          set.status = 401
          throw new Error('Unauthorized')
        }

        return payload
      },
      signUser: async (payload: Static<typeof jwtPayloadSchema>) => {
        setCookie('auth', await jwt.sign(payload), {
          httpOnly: true,
          maxAge: 7 * 86400,
        })
      },
    }
  })
  .derive(({ getCurrentUser, set }) => {
    return {
      getManagedRestaurantId: async () => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) {
          set.status = 401

          throw new Error('User is not a restaurant manager.')
        }

        return restaurantId
      },
    }
  })
