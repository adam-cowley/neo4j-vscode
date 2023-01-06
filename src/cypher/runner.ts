import { Driver } from 'neo4j-driver'
import * as vscode from 'vscode'
import { Method } from '../constants'
import OutputChannel from '../output'
import ResultWebView from '../result'
import ParameterProvider from '../parameters/parameters.manager'


export default class CypherRunner {

  constructor(
    public readonly context: vscode.ExtensionContext,
    public readonly parameters: ParameterProvider,
    public readonly driver: Driver
  ) {}

  async run(input: string, method: Method): Promise<void> {
    const queries = input.split(';\n')

    for (const query of queries) {
      if (query && query !== '') {
        await this.runSingle(query.trim(), method)
      }
    }
  }

  async runSingle(cypher: string, method: Method): Promise<void> {
    const session = this.driver.session()

    try {
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

      ResultWebView.show(res, cypher)
    }
    catch (e) {
      console.error(e)
    }
    finally {
      await session.close()
    }
  }
}
