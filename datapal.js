import DataPalApp from '@datapal/app'

const datapal = new DataPalApp({
  documentTypes: {
    bagaaiera7tq3xaz6sawmjhz4kqaomww46ifnky2fljxs73g3u2csh2epl3ha: {
      read: true,
      write: true,
    }
  },
})

export default datapal
