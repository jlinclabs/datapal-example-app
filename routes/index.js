import Router from 'express-promise-router'
import datapalRoutes from './datapal.js'

const routes = new Router()

routes.get('/', (req, res) => {
  res.render('pages/home')
})
routes.use(datapalRoutes)


export default routes
