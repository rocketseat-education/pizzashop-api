import Elysia, { t } from 'elysia'
import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { resend } from '@/mail/client'
import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'
import { env } from '@/env'

export const sendAuthenticationLink = new Elysia().post(
  '/auth-links',
  async ({ body, set }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      set.status = 401

      throw new Error('Unauthorized')
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.APP_BASE_URL)

    await resend.emails.send({
      from: 'Pizza Shop <naoresponda@fala.dev>',
      to: email,
      subject: '[Pizza Shop] Link para login',
      react: AuthenticationMagicLinkTemplate({
        userEmail: email,
        authLink: authLink.toString(),
      }),
    })
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
