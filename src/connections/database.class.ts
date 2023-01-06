import * as path from 'path'
import * as vscode from 'vscode'
import INode from "../tree/inode.interface"


export default class Database implements INode {
  constructor(
        private readonly name: string,
        private readonly address: string,
        private readonly role: string,
        private readonly requestedStatus: string,
        private readonly currentStatus: string,
        private readonly error: string,
        private readonly isDefault: boolean
  ) {}

  getTreeItem() {
    const status = this.currentStatus !== 'online' ? ` (${this.currentStatus})` : ''
    return {
      label: `${this.name}${status}`,
      contextValue: "connection",
      // collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      // iconPath: path.join(__filename, '..', '..', '..', 'images', this.currentStatus === 'offline' ? 'database-offline.svg' : 'database.svg')
    }
  }

  getChildren() {
    return []
  }

}