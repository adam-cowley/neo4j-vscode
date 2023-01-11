import { Driver } from 'neo4j-driver'
import * as vscode from 'vscode'
import { Method } from '../constants'
import OutputChannel from '../output'
import ResultWebView from '../result'
import ParameterProvider from '../parameters/parameters.manager'
import { querySummary } from '../utils'
import setParameterValue from '../commands/parameters/set-parameter-value'

export default class CypherRunner {

  constructor(
    public readonly context: vscode.ExtensionContext,
    public readonly parameters: ParameterProvider,
    public readonly driver: Driver
  ) {}

  async run(input: string, method: Method): Promise<void> {
    // Split text on ; and a new line
    const queries = input.split(';\n')

    // Run individual queries
    for (const query of queries) {
      if (query && query !== '') {
        await this.runSingle(query.trim(), method)
      }
    }
  }

  async runSingle(cypher: string, method: Method): Promise<void> {
    const session = this.driver.session()

    try {
      // Detect Parameters
      const parameters = cypher.match(/\$([a-z0-9_]+)/g)

      if ( parameters ) {
        for (const parameter of parameters) {
          if ( !this.parameters.has(parameter.substring(1)) ) {
            await setParameterValue(this.parameters, parameter.substring(1))
          }
        }
      }

      // Get parameter list
      const params = await this.parameters.asParameters()

      OutputChannel.append('--')
      OutputChannel.append(method)
      OutputChannel.append(cypher)
      OutputChannel.append(JSON.stringify(params, null, 2))

      const res = await session[method](
        tx => tx.run(
          cypher,
          params
        )
      )

      // Query Summary
      for ( const value of querySummary(res)) {
        OutputChannel.append(value)
      }

      ResultWebView.show(res, cypher)
    }
    catch (e: any) {
      OutputChannel.append('Error Running Query')
      OutputChannel.append(e.message)
      OutputChannel.show()

      console.error(e)
    }
    finally {
      await session.close()
    }
  }
}
