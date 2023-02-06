import { TreeItem } from "vscode"
import INode from "../tree/inode.interface"
import { iconPath } from '../utils'
import { Parameter } from "./parameters.manager"

export default class ParameterTreeItem implements INode {
  constructor(
    private readonly parameter: Parameter
  ) {}

  getKey(): string {
    return this.parameter.key
  }

  getTreeItem(): TreeItem | Promise<TreeItem> {
    return {
      id: this.parameter.key,
      label: `${this.parameter.key} (${this.parameter.type})`,
      contextValue: "parameter",
      iconPath: iconPath('parameter'),
      command: {
        title: "Set Parameter Value",
        command: "neo4j.setParameterValue",
        arguments: [ this.parameter.key ],
        tooltip: "Set the value for this parameter",
      }
    }
  }

  getChildren(): INode[] | Promise<INode[]> {
    return []
  }
}
