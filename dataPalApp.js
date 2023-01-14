import DataPalApp from '@datapal/app'

const dataPalApp = new DataPalApp({
  origin: process.env.DATAPAL_ORIGIN,
  documentTypes: {
    profile: {
      permissions: {
        read: true,
      },
      versions: [
        'bagaaieral5us4xmjj7dhamjmzpv3eb4mdzzu3lujdvgcftstezkr4fkjizda'
      ]
    },
    shoppingList: {
      permissions: {
        read: true,
        write: true,
      },
      versions: [
        'bagaaiera3ehjpbcth73qlon57nqvr6b2gpdppsi4egb3nruzrejqttbzrxiq',
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
