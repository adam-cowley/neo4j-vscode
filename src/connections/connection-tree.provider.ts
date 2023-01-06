import * as vscode from 'vscode'
import { Connection } from '../constants'
import INode from '../tree/inode.interface'
import TreeProvider from '../tree/tree.provider'
import ConnectionManager from './connection-manager.class'
import Instance from './instance.class'


export default class ConnectionTreeProvider extends TreeProvider {
  constructor(
    context: vscode.ExtensionContext,
    private readonly connections: ConnectionManager
  ) {
    super(context)
  }

  public getChildren(element?: INode): Thenable<INode[]> | INode[] {
    if (!element) {
      return this.getConnectionNodes()
    }

    return element.getChildren()
  }

  getConnectionNodes(): Promise<INode[]> {
    const connections: Record<string, Connection> = this.connections.getState()

    return Promise.resolve(Object.entries(connections)
      .map(([id, n]) => new Instance(
        id,
        n.host,
        n.scheme,
        n.host,
        n.port,
        n.username,
        n.password,
        n.active
      )))
  }

}
