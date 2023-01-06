import * as path from 'path';
import * as vscode from 'vscode'
import INode from "../tree/inode.interface";
import neo4j, { Driver } from 'neo4j-driver'
import Database from './database.class';

export default class User implements INode {

    constructor(
        private readonly user: string,
        private readonly roles: string[],
        private readonly passwordChangeRequired: boolean,
        private readonly suspended: boolean
    ) {}

    getTreeItem() {
        // const icon = this.suspended ? 'user-disabled.svg' : 'user.svg'
        const status = this.suspended ? ` (suspended)` : ''

        return {
            label: `${this.user}${status}`,
            // collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            contextValue: "database",
            // iconPath: path.join(__filename, '..', '..', '..', 'images', 'icons', icon)
        }
    }

    getChildren() {
        return []
    }

}