export type Enviroment = {
  DISCORD_NACL_PUBLIC_KEY: string
  STORAGE: KVNamespace
  SENTRY_DSN: string
  [key: string]: any
}
// env gets modified sometimes, so we need to allow any
// these are the only keys that are consistent
