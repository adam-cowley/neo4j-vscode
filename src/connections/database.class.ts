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
      contextValue: "database",
    }
  }

  getChildren() {
    return []
  }

}