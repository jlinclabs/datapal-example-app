import Router from 'express-promise-router'

import authRoutes, { requireAuth } from './auth.js'

const routes = new Router()

routes.use(authRoutes)

routes.get('/', async (req, res) => {
  const returnTo = req.query.returnTo
  const referer = req.get('Referer')
  console.log('🎆', { referer, returnTo })

  if (referer && returnTo){
    const host = new URL(referer).hostname
    if (new URL(returnTo).hostname === host){
      req.session.shareWithApp = { host, returnTo }
    }
  }

  const locals = {...res.locals}

  if (req.session.shareWithApp && req.datapal) {
    locals.shareWithApp = await req.datapal.findApp({
      host: req.session.shareWithApp.host,
    })
    locals.shareWithAppUrl = req.session.shareWithApp.returnTo
  }

  if (req.datapal) {
    const [profile, shoppingListDocument] = await Promise.all([
      req.datapal.findDocument({documentType: 'profile'}),
      req.datapal.findDocument({documentType: 'proofYouCanDrink'})
    ])
    locals.profile = profile.value
    locals.profileUrl = profile.uri
    locals.shoppingListDocument = shoppingListDocument

    if (!profile){
      const url = req.datapal.requestDocumentRedirect({
        documentType: 'profile',
        purpose: 'So can show your profile to you and ONLY you.',
        returnTo: req.url, //TODO complete? test!
      })
      res.redirect(307, url)
    }
  }
  locals.uploadedProof = !!req.session.uploadedProof
  locals.step1Complete = !!locals.user
  locals.step2Complete = !!(locals.step1Complete && locals.uploadedProof)
  locals.step3Complete = !!(locals.step2Complete && locals.shoppingListDocument)
  console.log('🎆', {locals, session: req.session })
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
    returnTo: '/',
  })
  res.redirect(redirectUrl)
})


export default routes
