import jwt from 'jsonwebtoken'

export const generateAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15 min' }, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  )
export const generateRefreshToken = (payload) => {
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1 week' }, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  )
}

export const verifyAccessToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        rej(err)
      } else {
        res(payload)
      }
    })
  )

export const authenticateUser = async (author) => {
  const accessToken = await generateAccessToken({ _id: user._id, role: user.role })
  const refreshToken = await generateRefreshToken({ _id: user._id })

  author.refreshToken = refreshToken
  await author.save()

  return { accessToken, refreshToken }
}

export const verifyRefreshTokenAndGenerateNewTokens = async (currentRefreshToken) => {
  try {
    const payload = await verifyRefreshToken(currentRefreshToken)

    const user = await UsersModel.findById(payload._id)
    if (!user) throw createHttpError(404, `User with id ${payload._id} not found!`)

    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await authenticateUser(user)
      return { accessToken, refreshToken }
    } else {
      throw createHttpError(401, 'Refresh token not valid!')
    }
  } catch (error) {
    throw createHttpError(401, 'Refresh token not valid!')
  }
}
