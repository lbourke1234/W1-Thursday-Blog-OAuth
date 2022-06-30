import createHttpError from 'http-errors'
import atob from 'atob'
import AuthorsModel from '../api/authors/model.js'

export const basicAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      console.log('no headers')
      next(createHttpError(401, 'No credentials provided!'))
    } else {
      const base64Credentials = req.headers.authorization.split(' ')[1]
      const [email, password] = atob(base64Credentials).split(':')

      const author = await AuthorsModel.checkCredentials(userName, password)

      if (author) {
        req.author = author
        next()
      } else {
        next(createHttpError(401, "Credentials don't match"))
      }
    }
  } catch (error) {
    console.log(error)
    next()
  }
}
