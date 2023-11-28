import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'

import { registerRestaurant } from './routes/register-restaurant'
import { registerCustomer } from './routes/register-customer'
import { authenticate } from './routes/authenticate'
import { createOrder } from './routes/create-order'
import { approveOrder } from './routes/approve-order'
import { cancelOrder } from './routes/cancel-order'
import { getOrders } from './routes/get-orders'
import { createEvaluation } from './routes/create-evaluation'
import { getEvaluations } from './routes/get-evaluations'
import { updateMenu } from './routes/update-menu'
import { updateProfile } from './routes/update-profile'
import { authentication } from './authentication'
import { getProfile } from './routes/get-profile'

const app = new Elysia()
  .use(cors())
  .use(authentication)
  .use(getProfile)
  .use(registerRestaurant)
  .use(registerCustomer)
  .use(authenticate)
  .use(createOrder)
  .use(approveOrder)
  .use(cancelOrder)
  .use(getOrders)
  .use(createEvaluation)
  .use(getEvaluations)
  .use(updateMenu)
  .use(updateProfile)

app.listen(3333)

console.log(
  `🔥 HTTP server running at ${app.server?.hostname}:${app.server?.port}`,
)
