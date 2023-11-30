import { db } from '@/db/connection'
import Elysia from 'elysia'
import { z } from 'zod'

export const getEvaluations = new Elysia().get(
  '/evaluations',
  async ({ query }) => {
    const { pageIndex } = z
      .object({
        pageIndex: z.coerce.number().default(0),
      })
      .parse(query)

    const evaluations = await db.query.evaluations.findMany({
      offset: pageIndex * 10,
      limit: 10,
      orderBy: (evaluations, { desc }) => desc(evaluations.createdAt),
    })

    return evaluations
  },
)
