import Router from 'express-promise-router'
import passport from '../passport.js'
import DataPalHTTPClient from '@datapal/http-client'

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

  if (req.user){
    req.datapal = DataPalHTTPClient.fromObject(req.user)
    res.locals.user = await req.datapal.whoami()
    // res.locals.user = {
    //   id
    //   displayName
    //   avatar
    // }
  }

  // if (req.session['oauth2:datapal.jlinx.test']){
  //   console.log(
  //     'oauth2:datapal.jlinx.test ----->',
  //     req.session['oauth2:datapal.jlinx.test']
  //   )
  //   // aparently a successful OIDC login yields this weird object
  //   /*
  //    *  state: {
  //    *    handle: '3FohAXj2xK3mtVr3BVggGS2l',
  //    *    code_verifier: 'B-53cr1n60wDpxgqMERSxVkeCujCjThm-EfQy9zGczQ'
  //    *  }
  //    *
  //    * I do not know how to use this yet
  //    **/
  //
  // }
  res.locals.process = {
    env: process.env,
  }
  /*res.locals.user = req.user
  res.locals.session = {...req.session}*/
  // res.locals.oauth = req.session['oauth2:datapal.jlinx.test']
  // res.locals.debug = {
  //   user: req.user,
  //   session: {...req.session},
  //   oauth: req.session['oauth2:datapal.jlinx.test'],
  // }
  next()
})
routes.get('/login', (req, res) => {
  res.redirect(`${process.env.DATAPAL_ORIGIN}/login/to/${process.env.HOST}`)
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

routes.get('/login/failed', (req, res, next) => {
  console.log(req)
  res.render('pages/login-failed', {
    error: `fake error here`
  })
})

// temporay hack until we can get oauth2 working
routes.post('/datapal/auth/callback', async (req, res) => {
  const { loginToken, returnTo = '/' } = req.query

  const datapal = new DataPalHTTPClient()
  await datapal.login(loginToken)
  const whoami = await datapal.whoami()
  console.log({ whoami })
  console.log({ cookie: datapal.cookie })

  const user = datapal.toObject()
  console.log('LOGGIING AS', { user })
  await new Promise((resolve, reject) => {
    req.login(user, function(error) {
      if (error) return reject(error)
      resolve()
    })
  })
  // this.session.datapalCookie = datapal.cookie
  // req.session.userId = userId
  // req.session.sessionSecret = sessionSecret
  // res.redirect(returnTo)
  // req.login
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

routes.get('/fake-login', (req, res, next) => {
  req.login({ id: 42, fake: true }, error => {
    if (error) return next(error)
    // res.redirect('/')
    res.render('redirect', {to: '/'})
  })
})
