import { readFile } from 'fs/promises'
import Router from 'express-promise-router'

import datapalRoutes from './datapal.js'

const routes = new Router()

routes.use(datapalRoutes)

const loadFake = async name =>
  JSON.parse(
    await readFile(`${process.env.APP_PATH}/fake/${name}.json`)
  )

routes.get('/', async (req, res) => {
  const products = await loadFake('products')
  res.render('pages/home', {
    products,
  })
})


routes.post('/cart/add/:productId', async (req, res) => {
  res.render('redirect', {
    to: `/login?returnTo=${req.url}`,
  })
})

export default routes
