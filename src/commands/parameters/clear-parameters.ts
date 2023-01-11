import { window } from 'vscode'
import ParameterManager from '../../parameters/parameters.manager'
import { YES } from "../../constants"

export default async function clearParameters(parameters: ParameterManager) {
  const confirm = await window.showQuickPick(
    [YES, 'No'],
    { placeHolder: 'Are you sure you would like to clear all parameters?' }
  )

  if (confirm === YES) {
    await parameters.clear()

    window.showInformationMessage('Parameters cleared')
  }
}
