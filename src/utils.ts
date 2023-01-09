import neo4j, {
  isDate,
  isDateTime,
  isDuration,
  isInt,
  isLocalDateTime,
  isLocalTime,
  isTime
} from "neo4j-driver"
import { Connection, Scheme, SCHEME_NEO4J } from "./constants"

export function extractCredentials(uri: string): Connection | undefined {
  // eslint-disable-next-line max-len
  const pattern = new RegExp(/^(((neo4j|bolt)(\+s?(sc)?)?)?:\/\/)?(([a-z0-9+.-]+):([a-z0-9+.-]+)@)?([a-z0-9+.-]+)(:([0-9]{4}))?(\?database=([a-z0-9-]+))?$/)

  const parts = uri.match(pattern)

  if (!parts) {
    return
  }

  const [
    _full,
    _full_scheme,
    scheme,
    _scheme_start,
    _secure,
    _unknown,
    _userpassat,
    username,
    password,
    host,
    _colonport,
    port,
    _databaseEquals,
    database,
  ] = parts

  return {
    scheme: (scheme || SCHEME_NEO4J) as Scheme,
    host,
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
