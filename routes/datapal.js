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

  if (req.user){
    req.datapal = dataPalApp.userSessionfromObject(req.user)
    res.locals.user = await req.datapal.whoami()
    // res.locals.user = {
    //   id
    //   displayName
    //   avatar
    // }
  }

  // if (req.session['oauth2:dataPalApp.jlinx.test']){
  //   console.log(
  //     'oauth2:dataPalApp.jlinx.test ----->',
  //     req.session['oauth2:dataPalApp.jlinx.test']
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
  // res.locals.oauth = req.session['oauth2:dataPalApp.jlinx.test']
  // res.locals.debug = {
  //   user: req.user,
  //   session: {...req.session},
  //   oauth: req.session['oauth2:dataPalApp.jlinx.test'],
  // }
  next()
})

export function getDataPalLoginUrl(searchParams){
  const url = new URL(`${process.env.DATAPAL_ORIGIN}/login/to/${process.env.HOST}`)
  if (searchParams)
    for (const key in searchParams)
      url.searchParams.set(key, searchParams[key])
  return url
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

routes.get('/login/failed', (req, res, next) => {
  console.log(req)
  res.render('pages/login-failed', {
    error: `fake error here`
  })
})

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

routes.get('/fake-login', (req, res, next) => {
  req.login({ id: 42, fake: true }, error => {
    if (error) return next(error)
    // res.redirect('/')
    res.render('redirect', {to: '/'})
  })
})
