import Elysia, { t } from 'elysia'
import dayjs from 'dayjs'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from './errors/unauthorized-error'

export const authenticateFromLink = new Elysia().use(authentication).get(
  '/auth-links/authenticate',
  async ({ signUser, query, set }) => {
    const { code, redirect } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new UnauthorizedError()
    }

    if (dayjs().diff(authLinkFromCode.createdAt, 'days') > 7) {
      throw new UnauthorizedError()
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
