/* eslint-disable node/no-callback-literal */
import { sign } from 'tweetnacl'
import { InteractionType, InteractionResponseType, APIInteraction, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v9'
import { Buffer } from 'buffer/index'
import { callback, createAutocompleteReply } from './util/interactions'
import Parser from '@thesharks/jagtag-js'
import Router from './util/router'

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request.clone()))
})

async function handleRequest (request: Request): Promise<any> {
  const r = new Router()
  r.post('/', async (request: Request) => {
    const body = await request.text()
    if (await checkSecurityHeaders(request, body)) {
      const ctx = JSON.parse(body) as APIInteraction
      switch (ctx.type) {
        case InteractionType.Ping:
          return new Response(JSON.stringify({ type: InteractionResponseType.Pong }), {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        // @ts-expect-error - undocumented officially as of now
        case 4: { // APPLICATION_COMMAND_AUTOCOMPLETE
          // @ts-expect-error - again, undocumented
          const values = await STORAGE.list({ prefix: `tag:${ctx.data.options[0].options[0].value}` })
          return await createAutocompleteReply(values.keys.map(x => x.name.slice(4)).map(x => ({ name: x, value: x })))
        }
        case InteractionType.ApplicationCommand: {
          if (ctx.data.name === 'tag') {
            const data = ctx.data as APIChatInputApplicationCommandInteractionData
            const options: any = (data.options != null) ? data.options[0] : []
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
                return callback(Parser(value, {
                  tagArgs: options.options.find((x: any) => x.name === 'args')?.value.split(' ') ?? []
                }))
              }
            }
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
