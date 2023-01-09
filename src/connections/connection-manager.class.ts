import * as vscode from 'vscode'
import { Connection, CONNECTIONS } from '../constants'
import {
  updateActiveConnectionStatusBarItem
} from '../status/connection-status'
import ConnectionTreeProvider from './connection-tree.provider'

export default class ConnectionManager {
  private readonly tree: ConnectionTreeProvider

  constructor(private readonly context: vscode.ExtensionContext) {
    this.tree = new ConnectionTreeProvider(context, this)
  }

  getTreeProvider(): ConnectionTreeProvider {
    return this.tree
  }

  getState(): Record<string, Connection> {
    return this.context.globalState.get(CONNECTIONS) || {}
  }

  hasConnections(): boolean {
    const state = this.getState()

    return Object.keys(state).length > 0
  }

  async updateState(state: Record<string, Connection>) {
    await this.context.globalState.update(CONNECTIONS, state)

    this.tree.refresh()

    updateActiveConnectionStatusBarItem(this)
  }

  async add(connection: Connection): Promise<void> {
    const connections = this.getState()

    // eslint-disable-next-line max-len
    let id = `${connection.scheme}://${connection.username}@${connection.host}:${connection.port}`
    if ( connection.database ) {
      id += `?database=${connection.database}`
    }

    // Active Connection?
    connection.active = Object.keys(connections).length === 0

    connections[ id ] = connection

    await this.updateState(connections)

    // Display a message box to the user
    vscode.window.showInformationMessage(`Connection added to ${id}.`)
  }

  async remove(id: string): Promise<void> {
    const connections = this.getState()

    if ( connections.hasOwnProperty(id) ) {
      delete connections[ id ]

      await this.updateState(connections)

      vscode.window.showInformationMessage(`Removed connection to ${id}.`)
    }
  }

  async setActive(id: string): Promise<void> {
    const connections = this.getState()

    if ( connections.hasOwnProperty(id) ) {
      // Set others inactive
      for (const key in connections) {
        connections[ key ].active = false
      }

      // Set this one to active
      connections[ id ].active = true

      await this.updateState(connections)

      vscode.window.showInformationMessage(`Active connection set to ${id}.`)
    }
  }

  async getActive(): Promise<Connection | undefined>  {
    const state = this.getState()
    for (const key in state) {
      if (state[key].active) {
        return state[key]
      }
    }
  }

  async clear() {
    await this.updateState({})
  }
}
