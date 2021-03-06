/**
 * Helper functions that when passed a request will return a
 * boolean indicating if the request uses that HTTP method,
 * header, host or referrer.
 */
const Method = (method: string) => (req: { method: string }) =>
  req.method.toLowerCase() === method.toLowerCase()
const Connect = Method('connect')
const Delete = Method('delete')
const Get = Method('get')
const Head = Method('head')
const Options = Method('options')
const Patch = Method('patch')
const Post = Method('post')
const Put = Method('put')
const Trace = Method('trace')

// const Header = (header: string, val: any) => (req: { headers: { get: (arg0: any) => any } }) => req.headers.get(header) === val
// const Host = (host: string) => Header('host', host.toLowerCase())
// const Referrer = (host: string) => Header('referrer', host.toLowerCase())

const Path = (regExp: { [Symbol.match](string: string): RegExpMatchArray | null }) => (req: { url: string }) => {
  const url = new URL(req.url)
  const path = url.pathname
  const match = path.match(regExp) || []
  return match[0] === path
}

/**
* The Router handles determines which handler is matched given the
* conditions present for each request.
*/
export default class Router {
  routes: any[]
  constructor () {
    this.routes = []
  }

  handle (conditions: ((req: any) => boolean)[], handler: any) {
    this.routes.push({
      conditions,
      handler
    })
    return this
  }

  connect (url: any, handler: any) {
    return this.handle([Connect, Path(url)], handler)
  }

  delete (url: any, handler: any) {
    return this.handle([Delete, Path(url)], handler)
  }

  get (url: any, handler: any) {
    return this.handle([Get, Path(url)], handler)
  }

  head (url: any, handler: any) {
    return this.handle([Head, Path(url)], handler)
  }

  options (url: any, handler: any) {
    return this.handle([Options, Path(url)], handler)
  }

  patch (url: any, handler: any) {
    return this.handle([Patch, Path(url)], handler)
  }

  post (url: any, handler: any) {
    return this.handle([Post, Path(url)], handler)
  }

  put (url: any, handler: any) {
    return this.handle([Put, Path(url)], handler)
  }

  trace (url: any, handler: any) {
    return this.handle([Trace, Path(url)], handler)
  }

  all (handler: any) {
    return this.handle([], handler)
  }

  route (req: any) {
    const route = this.resolve(req)

    if (route) {
      return route.handler(req)
    }

    return new Response('resource not found', {
      status: 404,
      statusText: 'not found',
      headers: {
        'content-type': 'text/plain'
      }
    })
  }

  /**
  * resolve returns the matching route for a request that returns
  * true for all conditions (if any).
  */
  resolve (req: any) {
    return this.routes.find((r: { conditions: any }) => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true
      }

      if (typeof r.conditions === 'function') {
        return r.conditions(req)
      }

      return r.conditions.every((c: (arg0: any) => any) => c(req))
    })
  }
}
