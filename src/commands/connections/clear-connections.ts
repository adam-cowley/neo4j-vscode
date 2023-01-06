import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { YES } from "../../constants"

export default async function clearConnections(connections: ConnectionManager) {
  const confirm = await window.showQuickPick(
    [YES, 'No'],
    { placeHolder: 'Are you sure you would like to clear all connections?' }
  )

  if (confirm === YES) {
    await connections.clear()

    window.showInformationMessage('Databases cleared')
  }
}
