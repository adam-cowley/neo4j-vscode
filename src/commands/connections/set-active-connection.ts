import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"

export default async function setActiveConnection(
  connections: ConnectionManager,
  selected?: string
) {
  if ( selected !== undefined ) {
    await connections.setActive(selected)

    return
  }

  const id = await window.showQuickPick(
    Object.keys(connections.getState()),
    { placeHolder: 'Choose active connection?'}
  )

  if (id) {
    await connections.setActive(id)
  }
}
