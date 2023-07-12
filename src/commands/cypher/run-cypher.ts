import { TextEditor, window } from 'vscode'
import ConnectionManager from '../../connections/connection-manager.class'
import { Method } from '../../constants'
import CypherRunner from '../../cypher/runner'

// Check if we are inside a code block based on the cursor position
const handleMarkdown = (editor: TextEditor):
  | {text: string; error?: never}
  | {text?: never; error: string} => {
  const markdown = editor.document.getText()

  const codeBlockRegex = /(```|~~~)+\s*cypher\s*\n([\s\S]*?)\n\1/g

  const cursorPosition = editor.selection.active

  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const codeBlockStart = editor.document.positionAt(match.index)
    const codeBlockEnd = editor.document.positionAt(match.index + match[0].length)

    if (cursorPosition.isAfterOrEqual(codeBlockStart)
      && cursorPosition.isBeforeOrEqual(codeBlockEnd)
    ) {
      const text = match[2].trim()
      if (text.length === 0) {
        return {error: 'No text in code block'}
      }

      return {text}
    } // Else: Check if the cursor is inside the next code block
  }
  return {error: 'Cursor is not inside a cypher code block'}
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

      let documentText: string
      if (isMarkdown) {
        const result = await handleMarkdown(editor)
        if (result.error) {
          window.showErrorMessage(result.error)
          return
        }
        documentText = result.text!
      } else {
        documentText = editor.document.getText()
        if (!documentText) {
          window.showErrorMessage(`No text in document`)
          return
        }
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
