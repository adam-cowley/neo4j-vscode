import { window, env, Uri } from 'vscode'
import ConnectionManager from "../../connections/connection-manager.class"
import Instance from '../../connections/instance.class'
import { isAuraConnection } from '../../utils'

export default async function openNeo4jBrowser(
  connections: ConnectionManager,
  selected?: Instance
) {
  const state = connections.getState()
  if ( selected === undefined ) {
    const id = await window.showQuickPick(
      Object.keys(state),
      { placeHolder: 'Choose active connection?'}
    )

    if ( id === undefined ) {
      return
    }

    selected = state[ id ] as Instance
  }

  if ( selected ) {
    const secure = selected.scheme.endsWith('+s') || selected.scheme.endsWith('+ssc')
    const port = isAuraConnection(selected.host) ? '' : `:7474`

    env.openExternal(Uri.parse(`http${secure ? 's': ''}://${selected.host}${port}`))
  }
}
