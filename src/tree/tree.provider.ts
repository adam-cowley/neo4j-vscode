import * as vscode from 'vscode'
import INode from './inode.interface'

export default abstract class TreeProvider implements vscode.TreeDataProvider<INode> {

  public _onDidChangeTreeData: vscode.EventEmitter<INode | undefined> = new vscode.EventEmitter<INode | undefined>()
  public readonly onDidChangeTreeData: vscode.Event<INode | undefined> = this._onDidChangeTreeData.event

  constructor(private readonly context: vscode.ExtensionContext) {}

  public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
    return element.getTreeItem()
  }

  abstract getChildren(element?: INode): Thenable<INode[]> | INode[]

  public refresh(element?: INode): void {
    this._onDidChangeTreeData.fire(element)
  }

}