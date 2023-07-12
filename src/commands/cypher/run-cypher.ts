import { TextEditor, window } from 'vscode'
import ConnectionManager from '../../connections/connection-manager.class'
import { Method } from '../../constants'
import CypherRunner from '../../cypher/runner'

type CodeBlockErrors = {
  notInsideCodeBlock: number[];
  emptyCodeBlock: number[];
}

function showBlockError(message: string, lines: number[]) {
  window.showErrorMessage(`${message} at line${
    lines.length > 1 ? 's' : ''
  }: ${lines.join(', ')}`)
}

/**
 * Handle errors for code blocks
 * @param errors The potential errors to handle
 * @returns Boolean indicating if there were errors
 */
function handleCodeBlockErrors({
  notInsideCodeBlock, emptyCodeBlock
}: CodeBlockErrors) {
  if (notInsideCodeBlock.length > 0) {
    showBlockError(`Cursor is not inside a code block`, notInsideCodeBlock)
    return true
  }

  if (emptyCodeBlock.length > 0) {
    showBlockError(`Empty code block`, emptyCodeBlock)
    return true
  }
}

/**
 * Get code blocks from markdown based on cursor position(s)
 * Informs the user if there are any errors
 * @param editor The text editor to get code blocks from
 * @returns The code blocks if no errors, else undefined
 */
function getCodeBlocks(editor: TextEditor): string[] | undefined {
  const markdown = editor.document.getText()

  const codeBlockRegex = /(```|~~~)+\s*cypher\s*\n([\s\S]*?)\n\1/g

  // Sorting and filtering prevents errors in code block matching
  const selections = [...editor.selections]
    .sort((a, b) => a.active.line - b.active.line)
    // Remove duplicate selections that share the same line
    .filter((selection, index, selections) => 
      selection.active.line !== selections[index - 1]?.active.line)

  const initialAccumulator = {
    codeBlocks: [] as string[],
    errors: {notInsideCodeBlock: [] as number[], emptyCodeBlock: [] as number[]}
  }

  // Get code blocks from markdown based on cursor position(s)
  const {codeBlocks, errors} = selections.reduce(({codeBlocks, errors}, selection) => {
    const cursorPosition = selection.active
    let match: RegExpExecArray | null

    // Find all code blocks
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const codeBlockStart = editor.document.positionAt(match.index)
      const codeBlockEnd = editor.document.positionAt(match.index + match[0].length)

      // Check if cursor is inside code block
      if (cursorPosition.isAfterOrEqual(codeBlockStart)
        && cursorPosition.isBeforeOrEqual(codeBlockEnd)) {
        const text = match[2].trim()
        if (text.length === 0) {
          errors.emptyCodeBlock.push(codeBlockStart.line + 1)
        } else {
          codeBlocks.push(text)
          return {codeBlocks, errors}
        }
      }
    }

    errors.notInsideCodeBlock.push(cursorPosition.line + 1)
    return {codeBlocks, errors}
  }, initialAccumulator)

  if (handleCodeBlockErrors(errors)) {
    return
  }

  return codeBlocks
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

    // Attempt to run entire file or code block(s) if no selection
    if (selections.length === 0) {
      const isMarkdown = editor.document.languageId === 'markdown'

      if (isMarkdown) {
        const codeBlocks = getCodeBlocks(editor)
        if (!codeBlocks) {
          return
        }
        await Promise.all(codeBlocks.map((codeBlock) => 
          cypherRunner.run(activeConnection, codeBlock, method)
        ))
      } else {
        const documentText = editor.document.getText()
        if (!documentText) {
          window.showErrorMessage(`No text in document`)
          return
        }
        await cypherRunner.run(activeConnection, documentText, method)
      }


      return
    }

    // For each selection:
    await Promise.all(selections.map(async (selection) => {
      const documentText = editor.document.getText(selection)

      await cypherRunner.run(activeConnection, documentText, method)
    }))
  }
}
