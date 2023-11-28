import Elysia from 'elysia'

export const createEvaluation = new Elysia().post('/evaluations', () => {
  return 'createEvaluation'
})
