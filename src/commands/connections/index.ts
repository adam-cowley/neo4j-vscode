import { window, commands, ExtensionContext } from "vscode"
import ConnectionManager from "../../connections/connection-manager.class"
import Instance from "../../connections/instance.class"
import { METHOD_READ, METHOD_WRITE } from "../../constants"
import CypherRunner from "../../cypher/runner"
import ParameterManager from "../../parameters/parameters.manager"
import runReadCypher from "../cypher/run-cypher"
import addAuraConnection from "./add-aura-connection"
import addConnection from "./add-connection"
import addLocalhost from "./add-localhost"
import clearConnections from "./clear-connections"
import openNeo4jBrowser from "./open-neo4j-browser"
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
      (connection?: Instance | string) => {
        if (connection instanceof Instance) {
          connection = connection.id
        }

        setActiveConnection(connections, connection)
      }
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.openNeo4jBrowser',
      (connection?: Instance) => openNeo4jBrowser(connections, connection)
    )
  )

  // Cypher Queries
  const runner = new CypherRunner(
    context,
    connections,
    parameters
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.runReadCypher',
      () => runReadCypher(connections, runner, METHOD_READ)
    )
  )

  context.subscriptions.push(
    commands.registerCommand(
      'neo4j.runWriteCypher',
      () => runReadCypher(connections, runner, METHOD_WRITE)
    )
  )
}
