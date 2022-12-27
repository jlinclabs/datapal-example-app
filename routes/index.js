import Router from 'express-promise-router'
import datapalRoutes from './datapal.js'

const routes = new Router()

routes.use(datapalRoutes)

routes.get('/', (req, res) => {
  res.render('pages/home')
})


export default routes
