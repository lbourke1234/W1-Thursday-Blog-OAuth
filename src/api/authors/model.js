import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ['User', 'Admin'], default: 'User' },
    token: { type: String },
    refreshToken: { type: String },
    googleID: { type: String }
  },
  { timestamps: true }
)

AuthorSchema.pre('save', async function (next) {
  const currentAuthor = this
  const plainPW = this.password

  if (currentAuthor.isModified('password')) {
    const hash = await bcrypt.hash(plainPW, 11)
    currentAuthor.password = hash
  }

  next()
})

AuthorSchema.methods.toJSON = function () {
  const authorDocument = this
  const authorObject = authorDocument.toObject()

  delete authorObject.password
  delete authorObject.__v
  delete authorObject.token

  return authorObject
}

AuthorSchema.static('checkCredentials', async function (email, plainPW) {
  const author = await this.findOne({ email })

  if (author) {
    const isMatch = await bcrypt.compare(plainPW, author.password)
    if (isMatch) {
      return author
    } else {
      return null
    }
  } else {
    return null
  }
})

export default model('Author', AuthorSchema)
