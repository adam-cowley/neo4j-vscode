import { window } from 'vscode'
import ParameterTreeItem from '../../parameters/parameter.tree-item'
import ParameterManager from "../../parameters/parameters.manager"
import { confirm } from '../confirm'

export default async function removeParameter(
  parameters: ParameterManager,
  selected?: ParameterTreeItem
): Promise<void> {
  if ( selected !== undefined ) {
    if ( await confirm(`Are you sure you want to remove \`${selected.getKey()}\`?`) ) {
      await parameters.remove(selected.getKey())
    }

    return
  }

  const keys = await parameters.keys()
  const key = await window.showQuickPick(
    keys,
    { placeHolder: `Which parameter would you like to remove?` }
  )

  if (!key) { return }

  await parameters.remove(key)
}
