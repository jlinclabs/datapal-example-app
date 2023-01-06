import Router from 'express-promise-router'

import authRoutes, { requireAuth } from './auth.js'

const routes = new Router()

routes.use(authRoutes)

routes.get('/', async (req, res) => {
  if (req.query.returnTo) req.session.returnTo = req.query.returnTo
  console.log('RETURN TO', req.session.returnTo)
  const referer = req.get('Referer')
  if (referer && req.datapal){
    const host = new URL(referer).hostname
    req.session.shareWithApp = await req.datapal.findApp({ host })
    console.log('shareWithApp', req.session.shareWithApp)
  }
  // if (req.query.shareWith){
  // }

  let shoppingListDocument
  if (req.datapal) {
    shoppingListDocument = await req.datapal.findDocument({
      documentType: 'proofYouCanDrink',
    })
  }
  const locals = {
    ...res.locals,
    returnTo: req.session.returnTo,
    shareWithApp: req.session.shareWithApp,
    shoppingListDocument,
    uploadedProof: !!req.session.uploadedProof,
  }
  locals.step1Complete = !!locals.user
  locals.step2Complete = !!(locals.step1Complete && locals.uploadedProof)
  locals.step3Complete = !!(locals.step2Complete && shoppingListDocument)
  res.render('pages/home', locals)
})

routes.post('/upload-proof', requireAuth, async (req, res) => {
  req.session.uploadedProof = true
  res.render('redirect', {to: '/'})
})

routes.get('/create', requireAuth, async (req, res) => {
  const redirectUrl = req.datapal.requestDocumentRedirect({
    documentType: 'proofYouCanDrink',
    purpose: 'So we can give you your digitial proof.',
    returnTo: req.query.returnTo || '/',
  })
  res.redirect(redirectUrl)
})


export default routes
