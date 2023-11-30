import Elysia, { t } from 'elysia'
import dayjs from 'dayjs'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { eq } from 'drizzle-orm'

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
      set.status = 401

      throw new Error('Invalid authentication code.')
    }

    if (dayjs().diff(authLinkFromCode.createdAt, 'days') > 7) {
      set.status = 401

      throw new Error('This link is expired, generate a new one.')
    }

    await signUser({
      sub: authLinkFromCode.userId,
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
