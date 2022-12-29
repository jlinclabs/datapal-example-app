import { readFile } from 'fs/promises'
import Router from 'express-promise-router'

import datapalRoutes from './datapal.js'

const routes = new Router()

routes.use(datapalRoutes)

const loadFake = async name =>
  JSON.parse(
    await readFile(`${process.env.APP_PATH}/fake/${name}.json`)
  )

const products = await loadFake('products')

routes.use((req, res, next) => {
  res.locals.products = products
  next()
})

routes.get('/', async (req, res) => {
  res.render('pages/home')
})

routes.post('/cart/add/:productId', async (req, res) => {
  const { productId } = req.params
  req.session.cart = req.session.cart || []
  req.session.cart.push(parseInt(productId, 10))
  res.render('redirect', { to: '/cart' })
  // res.json({ url: req.url })
  // res.render('redirect', {
  //   to: `/login?returnTo=${encodeURIComponent(req.url)}`,
  // })
})

routes.get('/cart', async (req, res) => {
  const cart = req.session.cart || []
  const productsInCart = cart.map(id => res.locals.products.find(p => p.id === id))
  res.render('pages/cart', {
    cart,
    productsInCart,
  })
})

export default routes
