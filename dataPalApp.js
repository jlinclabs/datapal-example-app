import DataPalApp from '@datapal/app'

const dataPalApp = new DataPalApp({
  origin: process.env.DATAPAL_ORIGIN,
  documentTypes: {
    // shopping list
    shoppingCart: {
      permissions: {
        read: true,
        write: true,
      },
      // versions: [
      //   'bagaaierad6f6uuqbyiu5sdgnvrqo3uevcnnbp77dkjrhe7q2xgahkqaggana',
      // ]
    },
    shippingAddress: {
      permissions: {
        read: true,
      },
      versions: [
        'bagaaierad6f6uuqbyiu5sdgnvrqo3uevcnnbp77dkjrhe7q2xgahkqaggana',
      ]
    }
  },
})

export default dataPalApp
