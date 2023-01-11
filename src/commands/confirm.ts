import { window } from 'vscode'
import { YES } from '../constants'

export async function confirm(placeHolder: string): Promise<boolean> {
  const confirm = await window.showQuickPick(
    [YES, 'No'],
    { placeHolder }
  )

  return confirm === YES
}