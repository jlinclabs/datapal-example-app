import { promisify } from 'node:util'
import Router from 'express-promise-router'
import passport from '../passport.js'
import dataPalApp from '../dataPalApp.js'

const routes = new Router()
export default routes

routes.use(passport.authenticate('session'))

routes.use(async (req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    // session: req.session,
    // user: req.user,
  })
  // TODO always make a datapal and use res.datapal.isLoggedIn ?
  if (req.user){
    req.datapal = dataPalApp.userSessionFromObject(req.user)
    const user = await req.datapal.whoami()
    console.log({ user })
    if (user){
      res.locals.user = user
    }else{
      await promisify(req.logout.bind(req))()
    }
  }
  res.locals.process = {
    env: process.env,
  }
  next()
})

export function getDataPalLoginUrl(searchParams){
  const url = new URL(`${process.env.DATAPAL_ORIGIN}/login/to/${process.env.HOST}`)
  if (searchParams)
    for (const key in searchParams)
      url.searchParams.set(key, searchParams[key])
  return url
}

export function requireAuth(req, res, next){
  if (req.user && req.datapal.isLoggedIn) return next()
  const params = {}
  if (req.method.toLowerCase() === 'get')
    params.returnTo = `${req.originalUrl}${new URLSearchParams(req.params)}`
  res.redirect(getDataPalLoginUrl(params))
}

routes.get('/login', (req, res) => {
  res.redirect(getDataPalLoginUrl())
})

routes.get('/auth/callback',
  passport.authenticate('oauth2', {
    // failureRedirect: '/login/failed',
    // failureMessage: true,
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
)

// temporay hack until we can get oauth2 working
routes.post('/datapal/auth/callback', async (req, res) => {
  const { loginToken, returnTo = '/' } = req.query

  const datapal = dataPalApp.newUserSession()
  await datapal.login(loginToken)
  const whoami = await datapal.whoami()
  const user = datapal.toObject()
  const { cookie, passport, ...otherSessionVariables } = req.session
  console.log({ otherSessionVariables })
  await promisify(req.login.bind(req))(user)
  Object.assign(req.session, otherSessionVariables)
  res.render('redirect', {to: returnTo})
})

routes.get('/logout', async (req, res, next) => {
  if (req.datapal) await req.datapal.logout()
  req.logout(error => {
    if (error) return next(error)
    res.render('redirect', {to: '/'})
  })
})
