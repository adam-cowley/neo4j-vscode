import * as path from 'path'
import INode from "../tree/inode.interface"

export default class User implements INode {

  constructor(
        private readonly user: string,
        private readonly roles: string[],
        private readonly passwordChangeRequired: boolean,
        private readonly suspended: boolean
  ) {}

  getTreeItem() {
    const icon = this.suspended ? 'user-disabled' : 'user'
    const status = this.suspended ? ` (suspended)` : ''

    return {
      label: `${this.user}${status}`,
      contextValue: "database",
      iconPath: {
        light: path.join(
          __filename, '..', '..', '..', 'images', 'icons', `${icon}-light.svg`
        ),
        dark: path.join(
          __filename, '..', '..', '..', 'images', 'icons', `${icon}-light.dark`
        ),
      },
    }
  }

  getChildren() {
    return []
  }

}