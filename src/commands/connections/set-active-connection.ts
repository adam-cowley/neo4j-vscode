import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import Instance from '../../connections/instance.class'

export default async function setActiveConnection(
  connections: ConnectionManager,
  selected?: Instance
) {
  if ( selected !== undefined ) {
    await connections.setActive(selected.id)

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
