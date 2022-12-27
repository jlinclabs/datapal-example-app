import express from 'express'
import bodyParser from 'body-parser'
import expressSession from 'express-session'
import { create } from 'express-handlebars'
import './environment.js'
import routes from './routes/index.js'

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

app.use(express.static('./static'))

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


app.use(routes)

export default app
