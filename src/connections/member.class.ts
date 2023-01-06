import * as path from 'path'
import * as vscode from 'vscode'
import INode from "../tree/inode.interface"

export default class Member implements INode {

  constructor(private readonly member: string) {}

  getTreeItem() {
    return {
      label: this.member
    }
  }

  getChildren() {
    return []
  }
}