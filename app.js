import express from 'express'
import bodyParser from 'body-parser'
import expressSession from 'express-session'
import { create } from 'express-handlebars'

import './environment.js'
import passport from './passport.js'



const hbs = create({
  helpers: {
    toJSON(object){
      return JSON.stringify(object, null, 2)
    }
  }
})

const app = express()

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('views', './views')


app.use(express.urlencoded({
  extended: true,
}))

app.use(bodyParser.json())

app.use(expressSession({
  name: 'SESSION',
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  // trustProxy: process.env.NODE_ENV === 'production',
  trustProxy: true,
  cookie: {
    sameSite: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    secure: false, // true unless behind reverse proxy
    httpOnly: true,
  },
}))

app.use(passport.authenticate('session'))

app.use((req, res, next) => {
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
  res.locals.user = req.user
  next()
})

app.use((req, res, next) => {
  console.log('locals', res.locals)
  next()
})

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/login', passport.authenticate('oauth2'))

app.get('/auth/callback',
  passport.authenticate('oauth2', {
    failureRedirect: '/',
    failureMessage: true,
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
)

app.get('/fake-login', (req, res, next) => {
  req.login({ id: 42, fake: true }, error => {
    if (error) return next(error)
    // res.redirect('/')
    res.render('redirect', {to: '/'})
  })
})
// app.render('/', 'pages/home')

// app.get('/auth/example', passport.authenticate('oauth2'));
//
// app.get('/auth/example/callback',
//   passport.authenticate('oauth2', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   },
// );

export default app
