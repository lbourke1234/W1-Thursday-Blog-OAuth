import GoogleStrategy from 'passport-google-oauth20'
import AuthorsModel from '../api/authors/model.js'
import { authenticateUser } from './tools.js'

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/authors/googleRedirect`
  },
  async (_, __, profile, passportNext) => {
    try {
      const author = await AuthorsModel.findOne({ email: profile._json.email })

      if (author) {
        const { accessToken, refreshToken } = await authenticateUser(author)

        passportNext(null, { accessToken, refreshToken })
      } else {
        const { given_name, family_name, email } = profile._json

        const newAuthor = new AuthorsModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleID: profile.id
        })
        const createdAuthor = await newAuthor.save()
        const { accessToken, refreshToken } = await authenticateUser(createdAuthor)

        passportNext(null, { accessToken, refreshToken })
      }
    } catch (error) {
      console.log(error)
      passportNext(error)
    }
  }
)
export default googleStrategy
