# JagTag Interactions

A simple Cloudflare worker that implements JagTags as slash commands for Discord

### Registering commands
In order to use this, you'd need to register the commands in `commands.json` with Discord, for example:

`curl -vX PUT -h "Content-Type: application/json" -h "Authorization: Bot <TOKEN>" -d @commands.json https://discord.com/api/v8/applications/<APPLICATION_ID>/commands`

Refer to the [documentation from Discord](https://discord.com/developers/docs/interactions/slash-commands#endpoints)

### Deploying to Cloudflare
First off, copy `wrangler.toml.example` to `wrangler.toml` and set assosiated variables, like your account ID and the Discord NaCL key.

If you haven't already, install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update)

If you're running Wrangler version v1.15.0 or above, just run `wrangler publish`.
If not, run `npm run deploy`