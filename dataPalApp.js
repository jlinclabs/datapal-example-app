import DataPalApp from '@datapal/app'

const dataPalApp = new DataPalApp({
  origin: process.env.DATAPAL_ORIGIN,
  documentTypes: {
    // shopping list
    proofYouCanDrink: {
      permissions: {
        read: true,
        write: true,
      },
      versions: [
        'bagaaierafc5l3gtivkdjwwbw6mps3gexhv2okq3srwrzh52ccqzgbwmlijxa',
      ]
    }
  },
})

export default dataPalApp
