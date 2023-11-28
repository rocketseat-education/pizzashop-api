import Elysia from 'elysia'
import { authentication } from '../authentication'

export const authenticate = new Elysia()
  .use(authentication)
  .post('/sessions', async ({ jwt, cookie, setCookie }) => {
    setCookie('auth', await jwt.sign({ name: 'Diego' }), {
      httpOnly: true,
      maxAge: 7 * 86400,
    })

    return `Sign in as ${cookie.auth}`
  })
