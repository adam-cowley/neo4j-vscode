import * as vscode from 'vscode'
import INode from "../tree/inode.interface"

export default class Label implements INode {

  constructor(
    private readonly label: string,
    private readonly contextValue: string,
    private readonly iconPath?: string,
    private readonly children: INode[] = []
  ) {}

  getTreeItem() {
    return {
      label: this.label,
      collapsibleState: this.children.length ? vscode.TreeItemCollapsibleState.Collapsed : undefined,
      iconPath: this.iconPath,
      contextValue: this.contextValue
    }
  }

  getChildren() {
    return this.children
  }

}