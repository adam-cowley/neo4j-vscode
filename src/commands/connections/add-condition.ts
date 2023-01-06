import { window } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import { Scheme, schemes } from '../../constants'

export default async function addConnection(connections: ConnectionManager) {
  const scheme = await window.showQuickPick(
    schemes,
    { placeHolder: `Which scheme would you like to connect with?` }
  ) as Scheme | undefined
  if (!scheme) { return }

  const host = await window.showInputBox({
    prompt: "Host?",
    placeHolder: "eg. localhost",
    ignoreFocusOut: true
  })
  if (!host) { return }

  const port = await window.showInputBox({
    prompt: "Port?",
    placeHolder: "eg. 7687",
    ignoreFocusOut: true
  }) || '7687'


  const username = await window.showInputBox({
    prompt: "Username?",
    placeHolder: "eg. neo4j",
    ignoreFocusOut: true
  }) || 'neo4j'

  const password = await window.showInputBox({
    prompt: "Password?",
    placeHolder: "********",
    ignoreFocusOut: true
  })
  if (!password) { return }

  const database = await window.showInputBox({
    prompt: "Default Database?",
    placeHolder: "Optional",
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
