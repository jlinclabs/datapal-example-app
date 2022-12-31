import { URL } from 'node:url'
import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'

console.log(
  'process.env.NODE_TLS_REJECT_UNAUTHORIZED',
  process.env.NODE_TLS_REJECT_UNAUTHORIZED
)

export default class DataPalApp {
  constructor(options) {
    this.origin = options.origin
    this.documentTypes = options.documentTypes || {}
  }
  newUserSession(){
    return new DataPalUserSession(this)
  }
  userSessionFromObject(object){
    return new DataPalUserSession(this, object)
  }
}


class DataPalUserSession {

  constructor(client, { cookie, appAccountId } = {}) {
    this.client = client
    this.cookie = cookie
    this.appAccountId = appAccountId
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
    return {
      cookie: this.cookie,
      appAccountId: this.appAccountId,
    }
  }

  async login(appAccountLoginToken) {
    const { appAccountId } = await this.do('session.login', { appAccountLoginToken })
    this.appAccountId = appAccountId
  }

  async logout() {
    try{
      await this.do('session.logout', {})
      delete this.appAccountId
    }catch(error){
      console.error(error)
    }
    delete this.cookie
  }

  get isLoggedIn(){ return !!this.appAccountId }

  async whoami(){
    if (!this.isLoggedIn) return
    try {
      return await this.get('session.get')
    }catch(error){
      console.error(`DataPal error`, error)
      delete this.cookie
    }
  }

  async findDocument({ documentType }){
    const documentTypeSpec = this.client.documentTypes[documentType]
    const documentTypeId = documentTypeSpec.versions[0]
    const { documents } = await this.get('documents.forType', { documentTypeId })
    console.log('documents', documents)
    return documents[0]
  }

  requestDocumentRedirect({ documentType, purpose, returnTo, read = true, write }){
    const url = new URL(this.client.origin)
    url.pathname = `/accounts/${this.appAccountId}/documents/request`
    const documentTypeSpec = this.client.documentTypes[documentType]
    // TODO encrypt it up here
    url.searchParams.set('type', documentTypeSpec.versions[0])
    url.searchParams.set('purpose', purpose)
    url.searchParams.set('returnTo', returnTo)
    if (read) url.searchParams.set('read', 1)
    if (write) url.searchParams.set('write', 1)
    return url
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

  async requestDocument(){

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
      const url = `${this.client.origin}/api/v1/${path}`
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
