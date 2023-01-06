import Router from 'express-promise-router'

import authRoutes, { requireAuth } from './auth.js'

const routes = new Router()


routes.use((req, res, next) => {
  res.locals.uploadedProof = !!req.session.uploadedProof
  next()
})

routes.use(authRoutes)

routes.get('/', async (req, res) => {
  res.render('pages/home')
})

routes.post('/upload-proof', requireAuth, async (req, res) => {
  req.session.uploadedProof = true
  res.render('redirect', {to: '/'})
})


export default routes
