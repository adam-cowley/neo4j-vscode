import { window } from 'vscode'
import { ParameterType, parameterTypes } from '../../constants'
import ParameterManager from "../../parameters/parameters.manager"

export default async function verboseSetParameter(
  parameters: ParameterManager
): Promise<void> {
  const key = await window.showInputBox({
    prompt: "Key",
    // eslint-disable-next-line max-len
    placeHolder: "This parameter can be used by prefixing the key with $ in your Cypher statements",
    ignoreFocusOut: true,
  })
  if (!key) { return }

  const value = await window.showInputBox({
    prompt: "Value",
    ignoreFocusOut: true,
  })
  if (!value) { return }

  const type = await window.showQuickPick(
    parameterTypes,
    {placeHolder: 'What type is this data?'}
  )

  await parameters.set(key.trim(), value.trim(), type as ParameterType)
}
