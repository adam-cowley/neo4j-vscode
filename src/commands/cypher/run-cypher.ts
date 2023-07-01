import * as vscode from 'vscode'
import {window} from 'vscode'
import ConnectionManager from '../../connections/connection-manager.class'
import {Method} from '../../constants'
import CypherRunner from '../../cypher/runner'

// Check if we are inside a code block based on the cursor position
const handleMarkdown = (editor: vscode.TextEditor) => {
  const markdown = editor.document.getText()

  const codeBlockRegex = /(```|~~~)\s*context\n([\s\S]*?)\n\1/g
  
  const cursorPosition = editor.selection.active

  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const codeBlockStart = editor.document.positionAt(match.index)
    const codeBlockEnd = editor.document.positionAt(match.index + match[0].length)
    
    if (cursorPosition.isAfterOrEqual(codeBlockStart)
      && cursorPosition.isBeforeOrEqual(codeBlockEnd)
    ) {
      const documentText = match[1].trim()
      return documentText
    } // Else: Check if the cursor is inside the next code block
  }
  window.showErrorMessage(`Cursor is not inside a cypher code block`)
}

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

      
    // Attempt to run entire file or code block if no selection
    if (selections.length === 0) {
      const isMarkdown = editor.document.languageId === 'markdown'

      const documentText = 
        isMarkdown ? await handleMarkdown(editor) :
          editor.document.getText()

      if (!documentText) {
        window.showErrorMessage(`No text in ${isMarkdown ? 'code block' : 'document'}`)
        return
      }

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
