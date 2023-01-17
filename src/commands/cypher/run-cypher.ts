import { window, ExtensionContext } from 'vscode'
import ConnectionManager from '../../connections/connection-manager.class'
import { Method, METHOD_READ } from '../../constants'
import CypherRunner from '../../cypher/runner'
import ParameterManager from '../../parameters/parameters.manager'
import { getDriverForConnection } from '../../utils'

export default async function runCypher(
  connections: ConnectionManager,
  cypherRunner: CypherRunner,
  method: Method
): Promise<void> {
  // Get the active text editor
  const editor = window.activeTextEditor

  //  TODO: Only get selection
  if (editor) {
    // Get the active connection
    const activeConnection = await connections.getActive()

    if ( !activeConnection ) {
      window.showErrorMessage(`No active connection`)

      return
    }

    const selections = editor.selections
      .filter(selection => !selection.isEmpty
          && editor.document.getText(selection)
      )

    // Attempt to run entire file
    if (selections.length === 0) {
      const documentText = editor.document.getText()

      await cypherRunner.run(activeConnection, documentText, method)

      return
    }

    // For each selection:
    await Promise.all(selections.map(async (selection) => {
      const documentText = editor.document.getText(selection)

      await cypherRunner.run(activeConnection, documentText, method)
    }))
  }
}