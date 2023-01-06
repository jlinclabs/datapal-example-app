import { readFile } from 'fs/promises'
import Router from 'express-promise-router'

import authRoutes, { requireAuth } from './auth.js'
import cartRoutes from './cart.js'

const routes = new Router()

const loadFake = async name =>
  JSON.parse(
    await readFile(`${process.env.APP_PATH}/fake/${name}.json`)
  )

const products = await loadFake('products')

routes.use((req, res, next) => {
  res.locals.products = products
  next()
})

routes.use(authRoutes)

routes.get('/', async (req, res) => {
  res.render('pages/home')
})

routes.use(cartRoutes)

routes.get('/account', requireAuth, async (req, res) => {
  res.render('pages/account', {
    account: res.locals.user,
  })
})

routes.get('/datapal/select-shipping-address', (req, res, next) => {
  const redirectUrl = req.datapal.requestDocumentRedirect({
    documentType: 'shippingAddress',
    purpose: 'So we can ship you 🍷 😃',
    read: true,
    returnTo: req.query.returnTo,
  })
  res.redirect(redirectUrl)
})

export default routes
