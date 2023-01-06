import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"

export default async function removeConnection(connections: ConnectionManager) {
  const id = await window.showQuickPick(
    Object.keys(connections.getState()),
    { placeHolder: 'Which database would you like to remove?'}
  )

  if (id) {
    await connections.remove(id)
  }
}
