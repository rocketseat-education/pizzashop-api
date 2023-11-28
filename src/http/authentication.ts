import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import Elysia from 'elysia'

export const authentication = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: 'some-top-secret-string',
    }),
  )
  .use(cookie())
