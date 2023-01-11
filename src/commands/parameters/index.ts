import { window, commands, ExtensionContext } from "vscode"
import ParameterManager from "../../parameters/parameters.manager"
import clearParameters from "./clear-parameters"
import removeParameter from "./remove-parameter"
import setParameter from "./set-parameter"

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
      () => removeParameter(parameters)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.clearParameters',
      () => clearParameters(parameters)
    )
  )
}
