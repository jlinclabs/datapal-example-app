import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'

console.log(
  'process.env.NODE_TLS_REJECT_UNAUTHORIZED',
  process.env.NODE_TLS_REJECT_UNAUTHORIZED
)

export default class DataPalApp {
  newUserSession(){
    return new DataPalUserSession()
  }
  userSessionfromObject(object){
    return DataPalUserSession.fromObject(object)
  }
}


class DataPalUserSession {

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

  async login(appAccountLoginToken) {
    const res = await this.do('session.login', { appAccountLoginToken })
    console.log('logged in?', res)
  }

  async logout() {
    try{
      await this.do('session.logout', {})
    }catch(error){
      console.error(error)
    }
    delete this.cookie
  }

  get isLoggedIn(){ return !!(this.cookie /* TODO check harder */) }

  async whoami(){
    if (!this.isLoggedIn) return
    try {
      return await this.get('session.get')
    }catch(error){
      console.error(`DataPal error`, error)
      delete this.cookie
    }
  }

  /**
   *
   * we need a way of requesting one instance of a document type
   * the plan was to
   *   1. redirect to datapal with the details of the docment requested
   *   2. let the user select one and datapal will redirect back to us
   *
   *   what if apps want to create their own document?
   *   should we have them redirect to datapal for that?
   *
   *   we are going to need to be able to make empty documents
   *
   *   when an app requests a document and the user gives them one
   *   is it the app's responsability to remember that? if you're
   *   a file editor
   */



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
      error.message = `DataPal Request Error: ${error.message}`
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
