import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { extractCredentials } from '../../utils'

export default async function addAuraConnection(
  connections: ConnectionManager
) {
  const uri = await window.showInputBox({
    prompt: "Copy and paste your Connection URI from the Aura Console",
    placeHolder: "eg. neo4j+s://[dbid].databases.neo4j.io",
    ignoreFocusOut: true,
  })
  if (!uri) { return }

  const connection = extractCredentials(uri)

  if (!connection) { return }

  const username = await window.showInputBox({
    prompt: "Username?",
    placeHolder: "eg. neo4j",
    ignoreFocusOut: true,
    value: connection?.username || 'neo4j'
  })
  if (!username) { return }

  const password = await window.showInputBox({
    prompt: "Password?",
    placeHolder: "********",
    password: true,
    ignoreFocusOut: true,
    value: connection?.password
  })

  if (!password) { return }

  // Save Connection
  await connections.add({
    ...connection,
    username,
    password,
  })
}
