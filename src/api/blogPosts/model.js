import mongoose from 'mongoose'

const { Schema, model } = mongoose

const blogPostsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    content: { type: String, required: true },
    comments: [{ text: String }],
    authors: [{ type: mongoose.Types.ObjectId, ref: 'Author' }],
    likes: [{ type: mongoose.Types.ObjectId, ref: 'Author' }]
  },
  { timestamps: true }
)

blogPostsSchema.static('findBlogPostsWithAuthors', async function (query) {
  const total = await this.countDocuments(query.criteria)
  const blogPosts = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip || 0)
    .limit(query.options.limit || 10)
    .sort(query.options.sort)
    .populate({ path: 'authors' })

  return { total, blogPosts }
})

export default model('BlogPost', blogPostsSchema)
