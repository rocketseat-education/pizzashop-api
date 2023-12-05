export class NotAManagerError extends Error {
  constructor() {
    super('User is not a restaurant manager.')
  }
}
