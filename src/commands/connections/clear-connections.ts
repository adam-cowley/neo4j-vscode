import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { confirm } from '../confirm'

export default async function clearConnections(connections: ConnectionManager) {
  if ( await confirm('Are you sure you would like to clear all connections?') ) {
    await connections.clear()

    window.showInformationMessage('Databases cleared')
  }
}
