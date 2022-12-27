import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'

console.log(
  'process.env.NODE_TLS_REJECT_UNAUTHORIZED',
  process.env.NODE_TLS_REJECT_UNAUTHORIZED
)
export default class DataPalHTTPClient {

  static fromObject({ cookie }){
    return new this({ cookie })
  }

  constructor({ cookie } = {}) {
    this.cookie = cookie
    // const cookieJar = new fetchCookie.toughCookie.CookieJar()
    this.fetch = fetchCookie(fetch, {
      getCookieString: async () => {
        return this.cookie
      },
      setCookie: async cookieString => {
        this.cookie = cookieString.split(';')[0]
      },
    })
  }

  toObject(){
    return {cookie: this.cookie}
  }

  async login(authToken) {
    const res = await this.do('session.login', { authToken })
    console.log('logged in?', res)
  }

  async whoami(){
    return await this.get('session.get')
  }


  // PRIVATISH

  async get(name, options = {}){
    const json = JSON.stringify(options)
    const params = json === '{}' ? '' :
      '?' + new URLSearchParams({ o: json })
    return await this.apiFetch('GET', `${name}${params}`)
  }

  async do(name, options){
    return await this.apiFetch('POST', `${name}`, options)
  }

  async apiFetch(method, path, body, tries = 0){
    try {
      const url = `${process.env.DATAPAL_ORIGIN}/api/v1/${path}`
      const options = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // 'cookie': this.__cookie,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
      console.log('🐶 DATAPAL FETCH', { url, ...options })
      const res = await this.fetch(url, options)
      if (res.status === 502) {
        throw new Error(`API server looks down or you're offline`)
      }
      if (res.status === 504 && tries < 5) {
        await wait(500)
        return this.apiFetch(method, path, body, tries + 1)
      }
      // console.log('🐶 DATAPAL RESPONSE', {
      //   headers: res.headers.raw(),
      // })
      // const setCookie = res.headers.raw()['set-cookie']
      // if (setCookie) {
      //   console.log('🐶 SETTING COOKIE', setCookie)
      //   this.__cookie = parseCookies(setCookie)
      // }
      const {result, error} = await res.json()
      if (error) throw new Error(error.message)
      return result || null
    }catch(error){
      error.message = `Datapal Request Error: ${error.message}`
      throw error
    }
  }
}


const wait = ms => new Promise(resolve => {
  setTimeout(() => { resolve() }, ms)
})
//
// // https://stackoverflow.com/questions/34815845/how-to-send-cookies-with-node-fetch
// function parseCookies(raw) {
//   // const raw = response.headers.raw()['set-cookie'];
//   return raw.map((entry) => {
//     const parts = entry.split(';');
//     const cookiePart = parts[0];
//     return cookiePart;
//   }).join(';');
// }
