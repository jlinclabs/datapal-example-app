import passport from 'passport'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'

passport.use(new OAuth2Strategy(
  {
    authorizationURL: `${process.env.DATAPAL_ORIGIN}/api/oidc/auth`,
    tokenURL: `${process.env.DATAPAL_ORIGIN}/api/oidc/token`,
    clientID: process.env.OAUTH_DATAPAL_ID,
    clientSecret: process.env.OAUTH_DATAPAL_SECRET,
    callbackURL: `${process.env.APP_ORIGIN}/auth/callback`,
    state: true,
    pkce: true,
  },
  function(accessToken, refreshToken, profile, cb) {
    // User.findOrCreate({ exampleId: profile.id }, function (err, user) {
    //   return cb(err, user)
    // })
  }
))

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, JSON.stringify({ id: user.id }))
  })
})

passport.deserializeUser(function(user, cb) {
  console.log('passport.deserializeUser', { user })
  process.nextTick(function() {
    cb(null, JSON.parse(user))
  })
})

export default passport
