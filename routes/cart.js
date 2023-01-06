import Router from 'express-promise-router'
import { requireAuth } from './auth.js'

const routes = new Router()
export default routes

const documentType = 'shoppingList'

routes.use('/cart', requireAuth, async (req, res, next) => {
  req.shoppingListDocument = await req.datapal.findDocument({
    documentType,
  })
  if (req.shoppingListDocument) return next()
  const redirectUrl = req.datapal.requestDocumentRedirect({
    documentType,
    purpose: 'So we can store the 🍷 you want 😃',
    read: true,
    write: true,
    returnTo: '/cart' + req.url,
  })
  res.redirect(redirectUrl)
})

// GET instead of POST so we can be redirected back to here
routes.get('/cart/add/:productId', async (req, res) => {
  const productId = parseInt(req.params.productId, 10)
  const { returnTo } = req.query
  const product = res.locals.products.find(p => p.id === productId)
  const items = req.shoppingListDocument.value.items || []
  const existing = items.find(i => i.__wineaboutit_id === productId)
  if (existing){
    existing.quantity ??= 0
    existing.quantity++
  }else {
    items.push({
      quantity: 1,
      description: `${product.name} - ${product.variety}`,
      __wineaboutit_id: productId,
    })
  }
  await req.datapal.updateDocument(req.shoppingListDocument.id, { items })
  res.render('redirect', { to: returnTo || '/cart' })
})

routes.post('/cart/update-quantity', async (req, res) => {
  const { returnTo } = req.query
  const action = req.body.action
  const productId = parseInt(req.body.productId, 10)
  let items = req.shoppingListDocument.value.items || []
  const match = item => item.__wineaboutit_id === productId
  if (action === 'delete'){
    items = items.filter(i => !match(i))
  }else if (action === 'update'){
    const existing = items.find(match)
    const quantity = parseInt(req.body.quantity, 10)
    existing.quantity = quantity
  }
  await req.datapal.updateDocument(req.shoppingListDocument.id, { items })
  res.render('redirect', { to: returnTo || '/cart' })
})

routes.get('/cart', async (req, res) => {
  // const cart = req.session.cart || []
  // const productsInCart = cart.map(id => res.locals.products.find(p => p.id === id))
  const { shoppingListDocument } = req
  const items = shoppingListDocument.value.items || []
  const cart = items
    .map(item => ({
      ...item,
      product: item.__wineaboutit_id && res.locals.products
        .find(p => p.id === item.__wineaboutit_id)
    }))
    .filter(i => i.product)
  const shippingAddressDocument = await req.datapal.findDocument({
    documentType: 'shippingAddress',
  })
  res.render('pages/cart', {
    cart,
    shoppingListDocument,
    shippingAddressDocument,
  })
})
