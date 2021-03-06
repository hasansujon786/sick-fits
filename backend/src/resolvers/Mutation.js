import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {APP_SECRET} from '../config';

function setCookieToHeader(ctx, id) {
  const token = jwt.sign({userId: id}, APP_SECRET)
  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365 // 1yr
  })
}

const Mutation = {
  async createItem(_, args, ctx, info) {
    // TODO: check if the user is are logged in

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args.data
      }
    }, info)
    return item
  },

  async updateItem(_, {data, where}, ctx, info) {
    const updatedItem = await ctx.db.mutation.updateItem({
      data,
      where
    }, info)
    return updatedItem
  },

  async deleteItem(_, {where}, ctx, info) {
    // find the item
    const item = await ctx.db.query.item({where}, `{ id }`)
    // TODO
    // check if user own the item or has the permission
    // delete image form cloudinary
    return ctx.db.mutation.deleteItem({where}, info)
  },

  async signUp(_, args, ctx, info) {
    // hash the password
    console.log('signUp');
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: {set: ['USER']} // => for enum
      }
    }, info)
    // set cookie
    setCookieToHeader(ctx, user.id)
    return user
  },

  async signIn(_, {email, password}, ctx, info) {
    if (!email) throw new Error('Please enter your email.')
    if (!password) throw new Error('Please enter your password.')
    const user = await ctx.db.query.user({where: {email}}, info)
    // If no user for given email
    if (!user) {
      throw new Error(`No such user found for ${email}.`)
    }
    // if incorrect password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Incorrect password!')
    }
    // set cookie
    setCookieToHeader(ctx, user.id)
    return user
  },

  async signOut(_, __, ctx, ____) {
    ctx.response.clearCookie('token')
    return true
  }

};

export default Mutation


