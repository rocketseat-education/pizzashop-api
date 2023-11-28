import Elysia from 'elysia'

export const updateMenu = new Elysia().put('/menu', () => {
  return 'updateMenu'
})
