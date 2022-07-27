import { router } from './handler'
import { Enviroment } from './types'
import Toucan from 'toucan-js'

export default {
  async fetch (request: Request, env: Enviroment, context: any) {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context,
      request,
      allowedHeaders: ['user-agent'],
      allowedSearchParams: /(.*)/
    })
    try {
      return router.handle(request, env, context)
    } catch (error) {
      sentry.captureException(error)
      return new Response(
        'Internal server error',
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      )
    }
  }
}
