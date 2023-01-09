import { ExtensionContext } from "vscode"
import ConnectionManager from "../connections/connection-manager.class"
import registerDatabaseStatusBarItem from "./connection-status"

export default function registerStatusBarSubscriptions(
  context: ExtensionContext,
  connections: ConnectionManager
) {
  registerDatabaseStatusBarItem(context, connections)
}