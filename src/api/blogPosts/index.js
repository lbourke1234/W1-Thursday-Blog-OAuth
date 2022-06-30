import express from 'express'
import BlogPostsModel from './model.js'
import CommentsModel from '../blogPosts/model.js'
import AuthorsModel from '../authors/model.js'
import createError from 'http-errors'
import q2m from 'query-to-mongo'

import { basicAuthMiddleware } from '../../auth/basic.js'
import { JWTAuthMiddleware } from '../../auth/token.js'

const blogPostsRouter = express.Router()

blogPostsRouter.get('/', JWTAuthMiddleware, async (req, res, next) => {
  try {
    // const author = await AuthorsModel.findById(req.author._id)

    const articles = await BlogPostsModel.find({ authors: req.author._id })
    console.log('articles: ', articles)

    res.send(articles)

    // const mongoQuery = q2m(req.query)
    // const { total, blogPosts } = await BlogPostsModel.findBlogPostsWithAuthors(mongoQuery)
    // res.send({
    //   links: mongoQuery.links('http://localhost:5001/blogPosts', total),
    //   total,
    //   totalPages: Math.ceil(total / mongoQuery.options.limit),
    //   blogPosts
    // })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

blogPostsRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id).populate({
      path: 'authors'
    })
    if (blog) {
      res.send(blog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.post('/', basicAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new BlogPostsModel(req.body)
    const { _id } = await newBlog.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.put('/:id', basicAuthMiddleware, async (req, res, next) => {
  try {
    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.delete('/:id', basicAuthMiddleware, async (req, res, next) => {
  try {
    const deletedUser = await BlogPostsModel.findByIdAndDelete(req.params.id)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.post('/:id', async (req, res, next) => {
  try {
    const newComment = { ...req.body, createdAt: new Date() }

    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    )
    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:id/comments', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      res.send(blog.comments)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      const comment = blog.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (comment) {
        res.send(comment)
      } else {
        next(createError(404, `Comment with Id: ${req.params.commentId} not found!`))
      }
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.put('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.id)
    if (blog) {
      const index = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (index !== -1) {
        const updatedComment = {
          ...blog.comments[index],
          ...req.body
        }
        blog.comments[index] = updatedComment

        await blog.save()
        res.send(blog)
      }
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const updatedBlog = await BlogPostsModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    )
    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createError(404, `Blog with Id: ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.post('/:blogId/likes/:authorId', async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId)
    if (!author)
      return next(createError(404, `Author with id ${req.params.authorId} not found!`))
    const blog = await BlogPostsModel.findById(req.params.blogId)
    if (!blog)
      return next(createError(404, `Blog with id ${req.params.blogId} not found!`))
    // const foundLike = blog.likes.find((user) => user._id.toString())
    // if (foundLike) {
    //   const modifiedBlog = await BlogPostsModel.findByIdAndUpdate(
    //     blog,
    //     { $pull: { likes: req.params.authorId } },
    //     { new: true }
    //   )
    //   res.send(modifiedBlog)
    // } else {
    const modifiedBlog = await BlogPostsModel.findByIdAndUpdate(
      blog,
      { $push: { likes: req.params.authorId } },
      { new: true }
    )

    res.send(modifiedBlog)
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:blogId/likes/total', async (req, res, next) => {
  try {
    const blog = await BlogPostsModel.findById(req.params.blogId)
    if (!blog)
      return next(createError(404, `Blog with id ${req.params.blogId} not found!`))
    const likeLength = blog.likes.length
    res.send(likeLength.toString())
  } catch (error) {
    next(error)
  }
})
blogPostsRouter.get('/me/stories', basicAuthMiddleware, async (req, res, next) => {
  try {
    const blogs = await BlogPostsModel.find({ authors: req.author._id })
    console.log(blogs)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default blogPostsRouter
