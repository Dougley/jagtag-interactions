import Parser from '@thesharks/jagtag-js'
import { APIInteraction, InteractionType, InteractionResponseType, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/payloads/v10'
import { Router, Request as IttyRequest } from 'itty-router'
import { Enviroment } from './types'
import { concatUint8Arrays, valueToUint8Array } from './utils/crypto'
import { callback, createAutocompleteReply } from './utils/discord'

export const router = Router()

export async function verify (req: Request & IttyRequest, env: Enviroment) {
  env.body = await req.text()
  const signature = req.headers.get('X-Signature-Ed25519')
  const timestamp = req.headers.get('X-Signature-Timestamp')
  if (!signature || !timestamp) {
    return new Response(
      'Missing signature or token',
      { status: 428, headers: { 'Content-Type': 'text/plain' } }
    )
  }
  if (signature.length !== 128) {
    return new Response(
      'Invalid signature',
      { status: 403, headers: { 'Content-Type': 'text/plain' } }
    )
  }
  if (!await verifyKey(env.body, signature, timestamp, env.DISCORD_NACL_PUBLIC_KEY)) {
    return new Response(
      'Signature mismatch',
      { status: 403, headers: { 'Content-Type': 'text/plain' } }
    )
  }
}

const verifyKey = async (body: string, sig: string, ts: string, token: string) => {
  const pubkey = valueToUint8Array(token, 'hex')
  const timestamp = valueToUint8Array(ts)
  const signature = valueToUint8Array(sig, 'hex')
  const data = valueToUint8Array(body)
  const hashbody = concatUint8Arrays(timestamp, data)

  const key = await crypto.subtle.importKey(
    'raw',
    pubkey,
    { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
    false,
    ['verify']
  )
  return await crypto.subtle.verify('NODE-ED25519', key, signature, hashbody)
}

router.post('/discord', verify, async (req, env: Enviroment) => {
  const body = JSON.parse(env.body) as APIInteraction
  switch (body.type) {
    case InteractionType.Ping: {
      return new Response(
        JSON.stringify({ type: InteractionResponseType.Pong }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      // @ts-expect-error - ¯\_(ツ)_/¯
      const values = await env.STORAGE.list({ prefix: `tag:${body.data.options[0].options[0].value}` })
      return await createAutocompleteReply(values.keys.map(x => x.name.slice(4)).map(x => ({ name: x, value: x })))
    }
    case InteractionType.ApplicationCommand: {
      if (body.data.name === 'tag') {
        const data = body.data as APIChatInputApplicationCommandInteractionData
        const options: any = (data.options != null) ? data.options[0] : []
        switch (options.name) {
          case 'create': {
            await env.STORAGE.put(`tag:${options.options.find((x: any) => x.name === 'name').value}`, options.options.find((x: any) => x.name === 'content').value)
            return callback('Tag created!')
          }
          case 'remove': {
            await env.STORAGE.delete(`tag:${options.options.find((x: any) => x.name === 'name').value}`)
            return callback('Tag deleted!')
          }
          case 'show': {
            const value = await env.STORAGE.get(`tag:${options.options.find((x: any) => x.name === 'name').value}`)
            if (!value) return callback('No tag with that name', true)
            return callback(Parser(value, {
              tagArgs: options.options.find((x: any) => x.name === 'args')?.value.split(' ') ?? []
            }))
          }
          case 'raw': {
            const value = await env.STORAGE.get(`tag:${options.options.find((x: any) => x.name === 'name').value}`)
            if (!value) return callback('No tag with that name', true)
            return callback('```\n' + value + '\n```')
          }
        }
      }
    }
  }
})

router.get('/', async (req, env: Enviroment) => {
  const data = await env.STORAGE.list({ prefix: 'tag:' })
  return new Response(
    data.keys.map(x => x.name).join('\n'),
    { status: 200, headers: { 'Content-Type': 'text/plain' } }
  )
})
