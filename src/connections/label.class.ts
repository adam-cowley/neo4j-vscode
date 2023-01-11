import * as vscode from 'vscode'
import * as path from 'path'
import INode from "../tree/inode.interface"

export default class Label implements INode {

  constructor(
    private readonly label: string,
    private readonly contextValue: string,
    private readonly icon?: string,
    private readonly children: INode[] = []
  ) {}

  getTreeItem() {
    return {
      label: this.label,
      collapsibleState: this.children.length
        ? vscode.TreeItemCollapsibleState.Collapsed
        : undefined,
      iconPath: {
        light: path.join(
          __filename, '..', '..', '..', 'images', 'icons', `${this.icon}-light.svg`
        ),
        dark: path.join(
          __filename, '..', '..', '..', 'images', 'icons', `${this.icon}-light.dark`
        ),
      },
      contextValue: this.contextValue
    }
  }

  getChildren() {
    return this.children
  }

}