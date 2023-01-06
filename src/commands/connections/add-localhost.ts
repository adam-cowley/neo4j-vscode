import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { Connection } from '../../constants'
import { extractCredentials } from '../../utils'

export default async function addLocalhost(connections: ConnectionManager) {
  const password = await window.showInputBox({
    prompt: "Add neo4j://localhost:7687 with user neo4j?",
    placeHolder: 'Password',
    ignoreFocusOut: true
  })

  if (!password) {
    return
  }

  await connections.add({
    ...extractCredentials('neo4j://neo4j:neo@localhost:7687'),
    password,
  } as Connection)
}
