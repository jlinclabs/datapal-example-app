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
    proofYouCanDrink: {
      permissions: {
        read: true,
        write: true,
      },
      versions: [
        'bagaaieravf5a6buk2lgfkzqfzjpzvxr2uy7whqhsarg6mvgmjm3m3mwjvzcq',
      ]
    }
  },
})

export default dataPalApp
