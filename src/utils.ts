/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { window } from 'vscode'
import { join } from 'path'
import neo4j, {
  isDate,
  isDateTime,
  isDuration,
  isInt,
  isLocalDateTime,
  isLocalTime,
  isTime,
  QueryResult
} from "neo4j-driver"
import { Connection, Scheme, SCHEME_NEO4J } from "./constants"

export function extractCredentials(input: string): Connection | undefined {
  // Append protocol if none exists
  if (!input.includes('://')) {
    input = 'neo4j://' + input
  }

  // Parse URL
  const url = new URL(input)

  const { protocol, username, password, hostname, port, searchParams } = url
  const database = searchParams.get('database')

  return {
    scheme: (protocol.replace(':', '') || SCHEME_NEO4J) as Scheme,
    host: hostname,
    port: port || '7687',
    username,
    password,
    database,
    active: false,
  }
}

// TODO: Get tests working
// console.log(extractCredentials("neo4j+s://dbhash.databases.neo4j.io")) // {"scheme":"neo4j+s","host":"dbhash.databases.neo4j.io"}
// console.log(extractCredentials("bolt+s://dbhash.databases.neo4j.io")) // {"scheme":"bolt+s","host":"dbhash.databases.neo4j.io"}
// console.log(extractCredentials("dbhash.databases.neo4j.io")) // {"scheme":"neo4j","host":"dbhash.databases.neo4j.io"}
// console.log(extractCredentials("dbhash.databases.neo4j.io:1234")) // {"scheme":"neo4j","host":"dbhash.databases.neo4j.io","port":"1234"}
// console.log(extractCredentials("dbhash.databases.neo4j.io:1234?database=foo")) // {"scheme":"neo4j","host":"dbhash.databases.neo4j.io","port":"1234","database":"foo"}
// console.log(extractCredentials("neo4j+s://user:pass@dbhash.databases.neo4j.io:1234?database=foo")) // {"scheme":"neo4j+s","host":"dbhash.databases.neo4j.io","port":"1234","username":"user","password":"pass","database":"foo"}
// console.log(extractCredentials("wt")) // {"scheme":"neo4j","host":"wt"}
// console.log(extractCredentials("1234")) // {"scheme":"neo4j","host":"1234"}
// console.log(extractCredentials("127.0.0.1:1234")) // {"scheme":"neo4j","host":"127.0.0.1","port":"1234"}

/**
 * Convert Neo4j Properties back into JavaScript types
 *
 * @param {Record<string, any>} properties
 * @return {Record<string, any>}
 */
export function toNativeTypes(properties: Record<string, any>) {
  return Object.fromEntries(Object.keys(properties).map((key) => {
    let value = valueToNativeType(properties[key])

    return [key, value]
  }))
}

/**
 * Convert an individual value to its JavaScript equivalent
 *
 * @param {any} value
 * @returns {any}
 */
function valueToNativeType(value: any) {
  if (Array.isArray(value)) {
    value = value.map(innerValue => valueToNativeType(innerValue))
  }
  else if (isInt(value)) {
    value = value.toNumber()
  }
  else if (
    isDate(value) ||
        isDateTime(value) ||
        isTime(value) ||
        isLocalDateTime(value) ||
        isLocalTime(value) ||
        isDuration(value)
  ) {
    value = value.toString()
  }
  else if (typeof value === 'object' && value !== undefined && value !== null) {
    value = toNativeTypes(value)
  }

  return value
}

export function getDriverForConnection(activeConnection: Connection) {
  return neo4j.driver(
    `${activeConnection.scheme}://${activeConnection.host}:${activeConnection.port}`,
    neo4j.auth.basic(activeConnection.username, activeConnection.password)
  )
}

export function querySummary(result: QueryResult): string[] {
  const rows = result.records.length
  const counters = result.summary.counters
  const output = []

  // Streamed
  if ( rows > 0 ) {
    // Started streaming 1 records after 5 ms and completed after 10  ms.
    output.push(
      `Started streaming ${rows} record${rows === 1 ? '' : 's'} after ${result.summary.resultConsumedAfter}ms and completed after ${result.summary.resultAvailableAfter}ms.`
    )
  }

  if ( counters.containsUpdates() ) {
    const updates =  []

    const updateCounts = counters.updates()

    for (const key in updateCounts) {
      const count = updateCounts[key]
      if ( count > 0 ) {
        const parts = key.split(/(?=[A-Z])/)
        updates.push( `${count} ${parts.map(value => value.toLowerCase()).join(' ')}` )
      }
    }

    if ( updates.length > 0) {
      output.push(`${updates.join(', ')}.`)
    }
  }

  if ( counters.containsSystemUpdates() ) {
    output.push(`${counters.systemUpdates()} system updates.`)
  }

  return output
}

export function iconPath(filename: string): { light: string, dark: string} {
  return {
    light: join(
      __filename, '..', '..', 'images', 'icons', `${filename}-light.svg`
    ),
    dark: join(
      __filename, '..', '..', 'images', 'icons', `${filename}-dark.svg`
    ),
  }
}

export function isAuraConnection(host: string): boolean {
  return host.endsWith('.neo4j.io')
}

export async function extractCredentialsFromActiveEditor(): Promise<Partial<Connection>>  {
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
