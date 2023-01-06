import { window, commands, ExtensionContext } from "vscode"
import ConnectionManager from "../../connections/connection-manager.class"
import ParameterManager from "../../parameters/parameters.manager"
import runReadCypher from "../cypher/run-read-cypher"
import runWriteCypher from "../cypher/run-write-cypher"
import addAuraConnection from "./add-aura-connection"
import addConnection from "./add-condition"
import addLocalhost from "./add-localhost"
import clearConnections from "./clear-connections"
import removeConnection from "./remove-connection"
import setActiveConnection from "./set-active-connection"

export function connectionSubscriptions(
  context: ExtensionContext,
  connections: ConnectionManager,
  parameters: ParameterManager
) {
  context.subscriptions.push(
    window.registerTreeDataProvider(
      "neo4j.connections",
      connections.getTreeProvider()
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      "neo4j.removeConnection",
      () => removeConnection(connections)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.addLocalhost',
      async () => addLocalhost(connections)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.refresh',
      async () => connections.getTreeProvider().refresh()
    )
  )


  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.addConnection',
      () => addConnection(connections)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.addAuraConnection',
      () => addAuraConnection(connections)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.clearConnections',
      () => clearConnections(connections)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.setActiveConnection',
      () => setActiveConnection(connections)
    )
  )

  // Cypher Queries
  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.runReadCypher',
      () => runReadCypher(context, connections, parameters)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.runWriteCypher',
      () => runWriteCypher(context, connections, parameters)
    )
  )
}
