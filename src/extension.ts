// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Neo4jTreeDataProvider from './tree/neo4j-tree-data.provider';

import { CONNECTIONS, schemes } from './constants'





// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const treeDataProvider = new Neo4jTreeDataProvider(context)
	context.subscriptions.push(vscode.window.registerTreeDataProvider("neo4j", treeDataProvider))

	// console.log(treeDataProvider);





	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "neo4j" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('neo4j.clearConnections', async () => {
		const YES = 'Yes'

		const confirm = await vscode.window.showQuickPick([YES, 'No'], { placeHolder: 'Are you sure you would like to clear all connections?' })
		if ( confirm === YES ) {
			await context.globalState.update(CONNECTIONS, {})

			treeDataProvider.refresh()

			vscode.window.showInformationMessage('Databases cleared');
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('neo4j.addLocalhost', async () => {
		const password = await await vscode.window.showInputBox({ prompt: "Add neo4j://localhost:7687 with user neo4j?", placeHolder: 'Password', ignoreFocusOut: true })
		if ( !password ) return

		await treeDataProvider.addInstance('neo4j', 'localhost', '7687', 'neo4j', password)

		treeDataProvider.refresh()
	}))

	context.subscriptions.push(vscode.commands.registerCommand('neo4j.refresh', async () => {
		treeDataProvider.refresh()
	}))


	let disposable = vscode.commands.registerCommand('neo4j.addConnection', async () => {
		const scheme = await vscode.window.showQuickPick(schemes, { placeHolder: `Which scheme would you like to connect with?` })
		if ( !scheme ) return;

		const host = await vscode.window.showInputBox({ prompt: "Host?", placeHolder: "eg. localhost", ignoreFocusOut: true })
		if ( !host ) return;

		const port = await vscode.window.showInputBox({ prompt: "Port?", placeHolder: "eg. 7687", ignoreFocusOut: true }) || '7687'
		if ( !port ) return;

		const username = await vscode.window.showInputBox({ prompt: "Username?", placeHolder: "eg. neo4j", ignoreFocusOut: true }) || 'neo4j'
		if ( !username ) return;

		const password = await vscode.window.showInputBox({ prompt: "Password?", placeHolder: "********", ignoreFocusOut: true })
		if ( !password ) return;

		const database = await vscode.window.showInputBox({ prompt: "Default Database?", placeHolder: "Optional", ignoreFocusOut: true })

		// Save Connection
		await treeDataProvider.addInstance(scheme, host, port, username, password, database)


		treeDataProvider.refresh()
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
