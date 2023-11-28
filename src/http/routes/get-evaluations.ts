import Elysia from 'elysia'

export const getEvaluations = new Elysia().get('/evaluations', () => {
  return 'getEvaluations'
})
