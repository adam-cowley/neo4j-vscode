import * as path from 'path'
import * as vscode from 'vscode'
import INode from "../tree/inode.interface"
import Member from './member.class'

export default class Role implements INode {

  constructor(
        private readonly role: string,
        private readonly members: string[] = [],
  ) {}

  addMember(member: string) {
    this.members.push(member)
  }

  getTreeItem() {
    return {
      label: this.role,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: 'role'
    }
  }

  getChildren() {
    return this.members.length
      ? this.members.map(member => new Member(member))
      : [new Member('(none)')]
  }

}