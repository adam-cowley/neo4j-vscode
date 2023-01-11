import { window } from 'vscode'
import { ParameterType, parameterTypes, PARAMETER_TYPE_NULL } from '../../constants'
import ParameterManager from "../../parameters/parameters.manager"

export default async function setParameterValue(
  parameters: ParameterManager,
  key: string
): Promise<void> {
  const value = await window.showInputBox({
    prompt: `Missing parameter $${key} - Set a value`,
    ignoreFocusOut: true,
  })

  // Handle Null value
  if (!value) {
    await parameters.set(key, value, PARAMETER_TYPE_NULL)

    return
  }

  const type = await window.showQuickPick(parameterTypes, {
    placeHolder: 'What type is this data?'
  })

  await parameters.set(key, value.trim(), type as ParameterType)

}
