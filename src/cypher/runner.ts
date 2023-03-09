import { ExtensionContext } from 'vscode'
import { Connection, Method } from '../constants'
import OutputChannel from '../output'
import ParameterManager from '../parameters/parameters.manager'
import setParameterValue from '../commands/parameters/set-parameter-value'
import ResultWindow from './result-window.class'
import ConnectionManager from '../connections/connection-manager.class'
import { getDriverForConnection } from '../utils'

export default class CypherRunner {
  private results: Map<string, ResultWindow> = new Map()

  constructor(
    public readonly context: ExtensionContext,
    public readonly connections: ConnectionManager,
    public readonly parameters: ParameterManager,
  ) {}

  async run(connection: Connection, input: string, method: Method): Promise<void> {
    // Split text on ; and a new line
    const queries = input.split(';\n')

    // Run individual queries
    for (const query of queries) {
      if (query && query !== '') {
        await this.runSingle(connection, query.trim(), method)
      }
    }
  }

  async runSingle(connection: Connection, cypher: string, method: Method): Promise<void> {
    const driver = getDriverForConnection(connection)

    try {
      // Detect Missing Parameters
      const parameters = cypher.match(/\$([a-z0-9_]+)/gi)

      if ( parameters ) {
        for (const parameter of parameters) {
          if ( !this.parameters.has(parameter.substring(1)) ) {
            await setParameterValue(this.parameters, parameter.substring(1))
          }
        }
      }

      // Check for existing query result window
      const key = Buffer.from(cypher).toString('base64')

      if ( this.results.has(key) ) {
        return this.results.get(key)!.run(method)
      }

      const resultWindow = new ResultWindow(
        this.context,
        this.parameters,
        connection,
        cypher,
        method
      )

      // Add to map
      this.results.set(key, resultWindow)

      // Remove on close
      resultWindow.panel.onDidDispose(() => this.results.delete(key))

      // Run the query
      return resultWindow.run(method)
    }
    catch (e: any) {
      OutputChannel.append('Error Running Query')
      OutputChannel.append(e.message)
      OutputChannel.show()
    }
    finally {
      await driver.close()
    }
  }
}
