export const SCHEME_NEO4J = 'neo4j'
export const SCHEME_NEO4J_SECURE = 'neo4j+s'
export const SCHEME_NEO4J_SELF_SIGNED = 'neo4j+ssc'
export const SCHEME_BOLT = 'bolt'
export const SCHEME_BOLT_SECURE = 'bolt+s'
export const SCHEME_BOLT_SELF_SIGNED = 'bolt+ssc'

export const schemes = [
  SCHEME_NEO4J,
  SCHEME_NEO4J_SECURE,
  SCHEME_NEO4J_SELF_SIGNED,
  SCHEME_BOLT,
  SCHEME_BOLT_SECURE,
  SCHEME_BOLT_SELF_SIGNED,
] as const

export type Scheme = typeof schemes[number]

export const CONNECTIONS = 'neo4j.connections'

export interface Connection {
    scheme: Scheme;
    host: string;
    port: string;
    username: string;
    password: string;
    database?: string;
    active: boolean;
}

export const PARAMETERS = 'neo4j.parameters'

export const PARAMETER_TYPE_STRING = 'STRING'   // will keep value
export const PARAMETER_TYPE_INT = 'INT'         // neo4j.int(value)
export const PARAMETER_TYPE_FLOAT = 'FLOAT'     // parseFloat(value)
export const PARAMETER_TYPE_OBJECT = 'JSON or OBJECT'   // JSON.parse(value)
export const PARAMETER_TYPE_NULL = 'NULL'       // null

export const parameterTypes = [
  PARAMETER_TYPE_STRING,
  PARAMETER_TYPE_INT,
  PARAMETER_TYPE_FLOAT,
  PARAMETER_TYPE_OBJECT,
  PARAMETER_TYPE_NULL,
] as const

export type ParameterType = typeof parameterTypes[number]


export const METHOD_READ = 'executeRead'
export const METHOD_WRITE = 'executeWrite'

export type Method = typeof METHOD_READ | typeof METHOD_WRITE

export const YES = 'Yes'