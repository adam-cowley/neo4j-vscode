import { ExtensionContext } from 'vscode'

import { connectionSubscriptions } from './commands/connections'
import { parameterSubscriptions } from './commands/parameters'
import ConnectionManager from './connections/connection-manager.class'
import ParameterManager from './parameters/parameters.manager'

export function activate(context: ExtensionContext) {
  // Connection Management
  const connections = new ConnectionManager(context)
  const parameters = new ParameterManager(context)

  // Connections (& cypher queries)
  connectionSubscriptions(context, connections, parameters)

  // Parameters
  parameterSubscriptions(context, parameters)
}

export function deactivate() { }
