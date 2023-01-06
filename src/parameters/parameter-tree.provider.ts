import { ExtensionContext } from "vscode"
import INode from "../tree/inode.interface"
import TreeProvider from "../tree/tree.provider"
import ParameterTreeItem from "./parameter.tree-item"
import ParameterManager, { Parameter } from "./parameters.manager"

export default class ParameterTreeProvider extends TreeProvider {
  constructor(context: ExtensionContext, private readonly parameters: ParameterManager) {
    super(context)
  }

  public getChildren(element?: INode): Thenable<INode[]> | INode[] {
    if (!element) {
      return this.getConnectionNodes()
    }

    return element.getChildren()
  }

  getConnectionNodes(): Promise<INode[]> {
    const parameters: Record<string, Parameter> = this.parameters.getState()

    return Promise.resolve(
      Object.values(parameters)
        .map(parameter => new ParameterTreeItem(parameter)))
  }
}