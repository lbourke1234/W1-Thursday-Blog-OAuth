import mongoose from 'mongoose'
const { Schema, model } = mongoose

const commentsSchema =
  ({
    text: { type: String, required: true }
  },
  { timestamps: true })

export default model('Comment', commentsSchema)
