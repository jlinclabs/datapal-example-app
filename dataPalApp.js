import DataPalApp from '@datapal/app'

const dataPalApp = new DataPalApp({
  origin: process.env.DATAPAL_ORIGIN,
  documentTypes: {
    // shopping list
    shoppingList: {
      permissions: {
        read: true,
        write: true,
      },
      versions: [
        'bagaaierarinpjm5ag5uoiz6cdxvgcjqv7b2fbvsymongbrdbjv4nbnzlvovq',
      ]
    },
    shippingAddress: {
      permissions: {
        read: true,
      },
      versions: [
        'bagaaierawbht4eekjxnctz6isvwiabdc3ncot37v2ymuvpvpdriyqvgxwiwa',
      ]
    },
    proofYouCanBuyAlcohol: {
      permissions: {
        read: true,
      },
      versions: [
        'bagaaieravf5a6buk2lgfkzqfzjpzvxr2uy7whqhsarg6mvgmjm3m3mwjvzcq',
      ]
    }
  },
})

export default dataPalApp
