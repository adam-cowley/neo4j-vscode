import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { Connection, Scheme, schemes } from '../../constants'
import { extractCredentialsFromActiveEditor } from '../../utils'

export default async function addConnection(connections: ConnectionManager) {
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

  // Ask the user for options
  const scheme = await window.showQuickPick(
    schemes,
    { placeHolder: `Which scheme would you like to connect with?` }
  ) as Scheme | undefined
  if (!scheme) { return }

  const host = await window.showInputBox({
    prompt: "Host?",
    placeHolder: "eg. localhost",
    value: dotEnv.host,
    ignoreFocusOut: true
  })
  if (!host) { return }

  const port = await window.showInputBox({
    prompt: "Port?",
    placeHolder: "eg. 7687",
    value: dotEnv.port,
    ignoreFocusOut: true
  }) || '7687'


  const username = await window.showInputBox({
    prompt: "Username?",
    placeHolder: "eg. neo4j",
    value: dotEnv.username,
    ignoreFocusOut: true
  }) || 'neo4j'
  if (!username) { return }

  const password = await window.showInputBox({
    prompt: "Password?",
    password: true,
    value: dotEnv.password,
    placeHolder: "********",
    ignoreFocusOut: true
  })
  if (!password) { return }

  const database = await window.showInputBox({
    prompt: "Default Database?",
    placeHolder: "Optional",
    value: dotEnv.database || undefined,
    ignoreFocusOut: true
  })

  await connections.add({
    scheme,
    host,
    port,
    username,
    password,
    database,
    active: false,
  })
}
