import Router from 'express-promise-router'
import passport from '../passport.js'

const routes = new Router()
export default routes

routes.use(passport.authenticate('session'))

routes.use((req, res, next) => {
  console.log(`${req.protocol} ${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    session: req.session,
    user: req.user,
  })


  if (req.session['oauth2:datapal.jlinx.test']){
    console.log(
      'oauth2:datapal.jlinx.test ----->',
      req.session['oauth2:datapal.jlinx.test']
    )
    // aparently a successful OIDC login yields this weird object
    /*
     *  state: {
     *    handle: '3FohAXj2xK3mtVr3BVggGS2l',
     *    code_verifier: 'B-53cr1n60wDpxgqMERSxVkeCujCjThm-EfQy9zGczQ'
     *  }
     *
     * I do not know how to use this yet
     **/

  }
  res.locals.process = {
    env: process.env,
  }
  res.locals.user = req.user
  res.locals.session = {...req.session}
  res.locals.oauth = req.session['oauth2:datapal.jlinx.test']
  res.locals.debug = {
    user: req.user,
    session: {...req.session},
    oauth: req.session['oauth2:datapal.jlinx.test'],
  }
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
routes.get('/datapal/auth/callback', (req, res) => {

})

routes.get('/fake-login', (req, res, next) => {
  req.login({ id: 42, fake: true }, error => {
    if (error) return next(error)
    // res.redirect('/')
    res.render('redirect', {to: '/'})
  })
})
