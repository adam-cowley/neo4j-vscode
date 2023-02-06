import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from 'vscode'
import ConnectionManager from "../connections/connection-manager.class"

let activeConnectionStatusBarItem: StatusBarItem

export default function registerDatabaseStatusBarItem(
  context: ExtensionContext,
  connections: ConnectionManager
) {
  activeConnectionStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1)

  updateActiveConnectionStatusBarItem(connections)

  context.subscriptions.push(
    activeConnectionStatusBarItem
  )

  activeConnectionStatusBarItem.show()
}

export async function updateActiveConnectionStatusBarItem(
  connections: ConnectionManager
) {
  if (!activeConnectionStatusBarItem) {
    return
  }

  if ( !connections.hasConnections() ) {
    activeConnectionStatusBarItem.text = 'Add Neo4j Connection'
    activeConnectionStatusBarItem.command = 'neo4j.addConnection'
    return
  }

  const active = await connections.getActive()

  activeConnectionStatusBarItem.command = 'neo4j.setActiveConnection'

  activeConnectionStatusBarItem.text = active
    // eslint-disable-next-line max-len
    ? `$(database) ${active.scheme}://${active.username}@${active.host}:${active.port}${active.database ? `/${active.database}` : ''}`
    : '$(database) No Active Neo4j Connection'
}
