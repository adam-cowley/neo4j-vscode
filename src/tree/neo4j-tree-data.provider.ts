import * as vscode from 'vscode';
import { CONNECTIONS } from '../constants';
import INode from './inode.interface'
import Instance from './instance.class';

interface InstanceConfig {
    id: string;
    name: string;
    scheme: string;
    host: string;
    port: string;
    username: string;
    password: string;

}

export default class Neo4jTreeDataProvider implements vscode.TreeDataProvider<INode> {
    public _onDidChangeTreeData: vscode.EventEmitter<INode | undefined> = new vscode.EventEmitter<INode | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<INode | undefined> = this._onDidChangeTreeData.event;

	constructor(private readonly context: vscode.ExtensionContext) {}

	public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
        return element.getTreeItem();
    }

    public getChildren(element?: INode): Thenable<INode[]> | INode[] {
        if (!element) {
            return this.getConnectionNodes();
        }

        return element.getChildren();
    }

    getConnectionNodes(): Promise<INode[]> {
        const connections: Record<string, InstanceConfig> = this.context.globalState.get(CONNECTIONS) || {}

        return Promise.resolve(Object.values(connections)
            .map(n => new Instance(n.id, n.name, n.scheme, n.host, n.port, n.username, n.password)))
    }

    public refresh(element?: INode): void {
        this._onDidChangeTreeData.fire(element);
    }

    public async addInstance(scheme: string, host: string, port: string, username: string, password: string, database?: string): Promise<void> {
        const connections: Record<string, any> = this.context.globalState.get(CONNECTIONS) || {}

        let id = `${scheme}://${username}@${host}:${port}`
        if ( database ) id += '?database'

		connections[ id ] = {
			id,
			scheme,
			host,
			port,
			username,
			password,
			database,
		}

		await this.context.globalState.update(CONNECTIONS, connections)

		// Display a message box to the user
		vscode.window.showInformationMessage(`Connection added to ${scheme}://${username}@${host}:${port}${database ? ` with default database ${database}` : ''}.`);
    }

}
