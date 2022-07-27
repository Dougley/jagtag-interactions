import { APIInteraction, InteractionResponseType, Snowflake, Routes } from 'discord-api-types/v10'

export const callback = (msg: string | object, ephemeral: Boolean = false) => {
  return new Response(JSON.stringify({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      ...((typeof msg === 'string') ? { content: msg } : msg),
      allowed_mentions: {
        parse: []
      },
      ...(ephemeral ? { flags: 64 } : {})
    }
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const defer = () => {
  return new Response(JSON.stringify({
    type: InteractionResponseType.DeferredChannelMessageWithSource
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const editCallback = async (ctx: APIInteraction, msg: string | object) => {
  return await fetch(Routes.webhookMessage(ctx.application_id, '@original'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        ...((typeof msg === 'string') ? { content: msg } : msg),
        allowed_mentions: {
          parse: []
        }
      }
    })
  })
}

export const deleteCallback = async (ctx: APIInteraction) => {
  return await fetch(Routes.webhookMessage(ctx.application_id, '@original'), {
    method: 'DELETE'
  })
}

export const createMessage = async (ctx: APIInteraction, msg: string | object) => {
  return await fetch(Routes.webhook(ctx.application_id, ctx.token), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...((typeof msg === 'string') ? { content: msg } : msg),
      allowed_mentions: {
        parse: []
      }
    })
  })
}

export const deleteMessage = async (ctx: APIInteraction, msg: Snowflake) => {
  return await fetch(Routes.webhookMessage(ctx.application_id, msg), {
    method: 'DELETE'
  })
}

export const editMessage = async (ctx: APIInteraction, id: Snowflake, msg: string | object) => {
  return await fetch(Routes.webhookMessage(ctx.application_id, id), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...((typeof msg === 'string') ? { content: msg } : msg),
      allowed_mentions: {
        parse: []
      }
    })
  })
}

export const createAutocompleteReply = async (choices: Array<{name: string, value: string}>) => {
  return new Response(JSON.stringify({
    type: InteractionResponseType.ApplicationCommandAutocompleteResult,
    data: {
      choices
    }
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
