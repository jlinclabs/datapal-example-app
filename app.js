import express from 'express'
import bodyParser from 'body-parser'
import expressSession from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'

import handlebars from './handlebars.js'
import './environment.js'
import routes from './routes/index.js'

const app = express()

app.engine('handlebars', handlebars.engine)
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
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}))

app.use(routes)

export default app
