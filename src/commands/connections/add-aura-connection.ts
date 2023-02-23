import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { Connection } from '../../constants'
import { extractCredentials, extractCredentialsFromActiveEditor } from '../../utils'

export default async function addAuraConnection(
  connections: ConnectionManager
) {
  const dotEnv = await extractCredentialsFromActiveEditor()

  if ( dotEnv.scheme && dotEnv.host && dotEnv.port
    && dotEnv.username && dotEnv.password
  ) {
    await connections.add({
      ...(dotEnv as Connection),
      active: false,
    })

    return
  }

  const uri = await window.showInputBox({
    prompt: "Copy and paste your Connection URI from the Aura Console",
    placeHolder: "eg. neo4j+s://[dbid].databases.neo4j.io",
    ignoreFocusOut: true,
  })
  if (!uri) { return }

  try {
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
  catch(e: any) {
    window.showInformationMessage(`Unable to parse ${uri}.\n ${e.getMessage()}`)
  }
}
