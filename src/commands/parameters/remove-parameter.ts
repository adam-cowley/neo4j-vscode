import { window } from 'vscode'
import ParameterManager from "../../parameters/parameters.manager"

export default async function removeParameter(parameters: ParameterManager): Promise<void> {
  const keys = await parameters.keys()
  const key = await window.showQuickPick(
    keys,
    { placeHolder: `Which parameter would you like to remove?` }
  )

  if (!key) { return }

  await parameters.remove(key)
}
