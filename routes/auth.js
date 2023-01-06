import { promisify } from 'node:util'
import Router from 'express-promise-router'
import passport from '../passport.js'
import dataPalApp from '../dataPalApp.js'

const routes = new Router()
export default routes

routes.use(passport.authenticate('session'))

routes.use(async (req, res, next) => {


  console.log(`${req.protocol} ${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    session: req.session,
    user: req.user,
  })
  // TODO always make a datapal and use res.datapal.isLoggedIn ?
  console.log('👤', { user: req.user })
  if (req.user){
    req.datapal = dataPalApp.userSessionFromObject(req.user)
    const user = await req.datapal.whoami()
    if (user){
      res.locals.user = user
    }else{
      console.log('FAILED TO LOAD USER FROM DATA PAL. Logging Out!')
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
  const returnTo = `${req.originalUrl}${new URLSearchParams(req.params)}`
  console.log({ returnTo })
  res.redirect(getDataPalLoginUrl({ returnTo }))
  // res.render('pages/unauthorized')
}

routes.get('/login', (req, res) => {
  // let url = `${process.env.DATAPAL_ORIGIN}/login/to/${process.env.HOST}`
  let referer = req.get('Referer')
  let returnTo
  if (referer) {
    referer = new URL(referer)
    returnTo = referer.toString().split(referer.origin)[1]
    // url += '?returnTo=' + encodeURIComponent(returnTo)
  }
  res.redirect(getDataPalLoginUrl({ returnTo }))
})
// routes.get('/login', passport.authenticate('oauth2'))

routes.get('/auth/callback',
  passport.authenticate('oauth2', {
    // failureRedirect: '/login/failed',
    // failureMessage: true,
  }),
  function(req, res) {
    console.log('🚢 GET /auth/callback', {
      query: req.query,
    })
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
  console.log({ whoami })
  console.log({ cookie: datapal.cookie })

  const user = datapal.toObject()
  console.log('LOGINING IN AS', { user })
  // await promisify(req.login.bind(req))(user)

  await new Promise((resolve, reject) => {
    req.login(user, function(error) {
      if (error) return reject(error)
      resolve()
    })
  })

  res.render('redirect', {to: returnTo})
})

routes.get('/logout', async (req, res, next) => {
  if (req.datapal) await req.datapal.logout()
  req.logout(error => {
    if (error) return next(error)
    // res.redirect('/')
    res.render('redirect', {to: '/'})
  })
})

// routes.get('/datapal/select-shipping-address/callback', (req, res, next) => {
//   const { documentId } = req.query
//   res.json({
//     params: req.params,
//     query: req.query,
//   })
// })