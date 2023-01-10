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
  res.render('pages/account')
})

routes.get('/select-shipping-address', (req, res, next) => {
  const redirectUrl = req.datapal.requestDocumentRedirect({
    documentType: 'shippingAddress',
    purpose: 'So we can ship you 🍷 😃',
    returnTo: req.query.returnTo,
  })
  res.redirect(redirectUrl)
})

routes.get('/provide-proof-you-can-buy-alcohol', (req, res, next) => {
  const url = new URL(process.env.BOOSABLE_ORIGIN)
  url.pathname = '/'
  url.searchParams.set('returnTo', `${process.env.APP_ORIGIN}/boosable/callback`)
  res.redirect(`${url}`)
})

routes.post('/datapal/events', (req, res, next) => {
  console.log('DATAPAL WEB HOOK EVENT', req.body)
  res.json({})
})

routes.get('/boosable/callback', (req, res, next) => {
  const documentId = req.query.id
  const redirectUrl = req.datapal.requestDocumentRedirect({
    documentType: 'proofYouCanBuyAlcohol',
    documentId,
    purpose: 'So we can ship you 🍷 😃',
    returnTo: '/cart',
  })
  res.redirect(redirectUrl)
})

export default routes
