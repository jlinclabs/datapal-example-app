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
        'bagaaierapghfkom6cgmv4bi5vyc5mx2hvfms3cqwytgh23etescp2ckorxsa',
      ]
    }
  },
})

export default dataPalApp
