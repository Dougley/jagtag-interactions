import { APIInteraction, InteractionResponseType, Snowflake } from 'discord-api-types/v8'

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
  return await fetch(`https://discord.com/api/v8/webhooks/${DISCORD_APPLICATION_ID}/${ctx.token}/messages/@original`, {
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
  return await fetch(`https://discord.com/api/v8/webhooks/${DISCORD_APPLICATION_ID}/${ctx.token}/messages/@original`, {
    method: 'DELETE'
  })
}

export const createMessage = async (ctx: APIInteraction, msg: string | object) => {
  return await fetch(`https://discord.com/api/v8/webhooks/${DISCORD_APPLICATION_ID}/${ctx.token}`, {
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
  return await fetch(`https://discord.com/api/v8/webhooks/${DISCORD_APPLICATION_ID}/${ctx.token}/messages/${msg}`, {
    method: 'DELETE'
  })
}

export const editMessage = async (ctx: APIInteraction, id: Snowflake, msg: string | object) => {
  return await fetch(`https://discord.com/api/v8/webhooks/${DISCORD_APPLICATION_ID}/${ctx.token}/messages/${id}`, {
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
    type: 8, // APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
    data: {
      choices
    }
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
