import { TreeItem } from "vscode"
import INode from "../tree/inode.interface"
import { Parameter } from "./parameters.manager"

export default class ParameterTreeItem implements INode {
  constructor(
    private readonly parameter: Parameter
  ) {}

  getTreeItem(): TreeItem | Promise<TreeItem> {
    return {
      label: `${this.parameter.key} (${this.parameter.type})`,
      contextValue: ""
    }
  }

  getChildren(): INode[] | Promise<INode[]> {
    return []
  }
}
