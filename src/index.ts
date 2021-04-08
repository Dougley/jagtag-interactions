/* eslint-disable node/no-callback-literal */
import { sign } from 'tweetnacl'
import { APIInteraction, InteractionType, APIInteractionResponseType } from 'discord-api-types/v8'
import { Buffer } from 'buffer/index'
import { callback } from './util/interactions'
import Parser from '@thesharks/jagtag-js'
import Router from './util/router'

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request.clone()))
})

async function handleRequest (request: Request): Promise<any> {
  const r = new Router()
  r.post('/', async (request: Request) => {
    if (request.method !== 'POST') return Response.redirect('https://dougley.com')
    const body = await request.text()
    if (await checkSecurityHeaders(request, body)) {
      const ctx = JSON.parse(body) as APIInteraction
      if (ctx.type === InteractionType.Ping) return new Response(JSON.stringify({ type: APIInteractionResponseType.Pong }))
      if (ctx.data?.name === 'tag') { // pretty much guaranteed, but you never know
        const options: any = ctx.data?.options ? ctx.data?.options[0] : []
        switch (options.name) {
          case 'create': {
            await STORAGE.put(`tag:${options.options.find((x: any) => x.name === 'name').value}`, options.options.find((x: any) => x.name === 'content').value)
            return callback('Tag created!')
          }
          case 'remove': {
            await STORAGE.delete(`tag:${options.options.find((x: any) => x.name === 'name').value}`)
            return callback('Tag deleted!')
          }
          case 'show': {
            const value = await STORAGE.get(`tag:${options.options.find((x: any) => x.name === 'name').value}`)
            if (!value) return callback('No tag with that name', true)
            return callback(Parser(value))
          }
        }
      }
    }
    return new Response('Bad request', {
      status: 400
    })
  })
  r.get('/', async () => {
    const data = await STORAGE.list({ prefix: 'tag:' })
    return new Response(data.keys.map(x => x.name).join('\n'))
  })
  const resp = await r.route(request)
  return resp
}

async function checkSecurityHeaders (request: Request, body: string): Promise<boolean> {
  if (!request.headers.has('X-Signature-Ed25519') || !request.headers.has('X-Signature-Timestamp')) return false

  const signature = request.headers.get('X-Signature-Ed25519') as string
  const timestamp = request.headers.get('X-Signature-Timestamp') as string

  const verified = sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(DISCORD_NACL_PUBLIC_KEY, 'hex')
  )
  return verified
}
