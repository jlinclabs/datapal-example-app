import DataPalApp from '@datapal/app'

const dataPalApp = new DataPalApp({
  documentTypes: {
    // shopping list
    shippingAddress: {
      permissions: {
        read: true,
        write: true,
      },
      versions: [
        'bagaaierad6f6uuqbyiu5sdgnvrqo3uevcnnbp77dkjrhe7q2xgahkqaggana',
      ]
    }
  },
})

export default dataPalApp
