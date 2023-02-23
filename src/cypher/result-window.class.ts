import { window, WebviewPanel, ExtensionContext, ViewColumn } from "vscode"
import { Connection, Method } from "../constants"
import OutputChannel from "../output"
import ParameterManager from "../parameters/parameters.manager"
import { getDriverForConnection } from "../utils"
import type { SessionConfig } from "neo4j-driver"
import { getErrorContent, getLoadingContent, getResultContent } from "./result.utils"

export default class ResultWindow {
  public panel: WebviewPanel

  constructor(
    public readonly context: ExtensionContext,
    public readonly parameters: ParameterManager,
    public readonly connection: Connection,
    public readonly cypher: string,
    method: Method
  ) {
    this.panel = window.createWebviewPanel(
      "neo4j.result",
      cypher,
      ViewColumn.Two,
      { retainContextWhenHidden: true }
    )

    this.run(method)
  }

  async run(method: Method) {
    const driver = getDriverForConnection(this.connection)

    // Get parameter list
    const params = await this.parameters.asParameters()

    // Start output
    OutputChannel.append('--')

    OutputChannel.append(`${method} on database ${this.connection.database || 'neo4j'}`)
    OutputChannel.append(this.cypher)
    OutputChannel.append(JSON.stringify(params, null, 2))

    // Session Options
    const options: SessionConfig = {}
    if (this.connection.database && this.connection.database !== null) {
      options.database = this.connection.database
    }

    const session = driver.session(options)

    try {
      // Loading
      this.panel.webview.html = getLoadingContent(this.cypher, params)

      // Run it
      const res = await session[ method ](
        tx => tx.run(this.cypher, params)
      )

      // Show results in webframe
      this.panel.webview.html = getResultContent(this.cypher, params, res)
    }
    catch (e: any) {
      // Output error in neo4j channel
      OutputChannel.append('Error Running Query')
      OutputChannel.append(e.message)
      OutputChannel.show()

      // Update Webview
      this.panel.webview.html = getErrorContent(this.cypher, params, e)
    }
    finally {
      // Close the session
      await driver.close()
    }
  }
}
