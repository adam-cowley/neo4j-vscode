import { window } from 'vscode'
import { Connection, Scheme } from '../../constants'
import { extractCredentials } from '../../utils'

export async function getConnectionDetailsFromActiveEditor(): Promise<Partial<Connection>>  {
  // Check current file for .env
  let envScheme: Scheme | undefined,
    envHost: string | undefined,
    envPort: string | undefined,
    envUsername: string | undefined,
    envPassword: string | undefined,
    envDatabase: string | null | undefined

  if ( window.activeTextEditor ) {
    const text = window.activeTextEditor.document.getText()

    if (text?.includes('NEO4J_URI')) {
      const matchUri = text.match(/NEO4J_URI=(.*)/)
      const matchUsername = text.match(/NEO4J_USERNAME=(.*)/)
      const matchPassword = text.match(/NEO4J_PASSWORD=(.*)/)

      if ( matchUri ) {
        try {
          const res = extractCredentials(matchUri[1])

          envScheme = res?.scheme
          envHost = res?.host
          envPort = res?.port
          envDatabase = res?.database
        }
        catch(e:unknown) {}
      }
      if ( matchUsername ) {
        envUsername = matchUsername[1].trim() as string
      }
      if ( matchPassword ) {
        envPassword = matchPassword[1].trim() as string
      }

      return {
        scheme: envScheme,
        host: envHost,
        port: envPort,
        username: envUsername,
        password: envPassword,
        database: envDatabase,
      } as Partial<Connection>
    }
  }

  return {}
}