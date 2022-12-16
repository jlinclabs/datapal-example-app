#!/usr/bin/env node

import app from '../app.js'

const server = app.listen(process.env.PORT, () => {
  const { port } = server.address()
  console.log(`Started at ${process.env.APP_ORIGIN} -> http://localhost:${port}`)
})
