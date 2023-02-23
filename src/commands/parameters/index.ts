import { window, commands, ExtensionContext } from "vscode"
import ParameterTreeItem from "../../parameters/parameter.tree-item"
import ParameterManager from "../../parameters/parameters.manager"
import clearParameters from "./clear-parameters"
import removeParameter from "./remove-parameter"
import setParameter from "./set-parameter"
import setParameterValue from "./set-parameter-value"

export function parameterSubscriptions(
  context: ExtensionContext,
  parameters: ParameterManager
) {
  context.subscriptions.push(
    window.registerTreeDataProvider(
      "neo4j.parameters",
      parameters.getTreeProvider()
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.setParameter',
      () => setParameter(parameters)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.removeParameter',
      (selected: ParameterTreeItem) => removeParameter(parameters, selected)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.setParameterValue',
      (selected: ParameterTreeItem | string) => {
        if ( selected instanceof ParameterTreeItem ) {
          selected = selected.getKey()
        }
        setParameterValue(parameters, selected)
      }
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.clearParameters',
      () => clearParameters(parameters)
    )
  )
}
