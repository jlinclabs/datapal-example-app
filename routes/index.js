import Router from 'express-promise-router'

import authRoutes, { requireAuth } from './auth.js'

const routes = new Router()


routes.use((req, res, next) => {
  // res.locals.products = products
  next()
})

routes.use(authRoutes)

routes.get('/', async (req, res) => {
  res.render('pages/home')
})

routes.get('/account', requireAuth, async (req, res) => {
  res.render('pages/account', {
    account: res.locals.user,
  })
})


export default routes
