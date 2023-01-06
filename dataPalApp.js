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
        'bagaaierah3gsemlfybo6xtgvknspozckeso3t5vskg7ivr7wrm4zsmzveqaq',
      ]
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
