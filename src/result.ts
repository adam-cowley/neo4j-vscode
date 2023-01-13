import { QueryResult } from "neo4j-driver"
import * as vscode from "vscode"
import { toNativeTypes } from "./utils"

export default class ResultWebView {
  public static show(res: QueryResult, title: string = 'Neo4j Results') {
    const panel = vscode.window.createWebviewPanel(
      "Neo4j",
      title,
      vscode.ViewColumn.Two,
      { retainContextWhenHidden: true, }
    )

    panel.webview.html = ResultWebView.getWebviewContent(res)
  }

  public static getWebviewContent(res: QueryResult): string {
    return `
      <html>
      <head>
      <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
      <style>table{border-collapse:collapse; width: 100%}table,td,th{border:1px solid rgba(0, 0, 0, .5); padding:5px; vertical-align: top}th {font-weight: bold} </style>
      </head>
      <body>
        <details>
          <summary>Query Details</summary>
          <pre>${res.summary.query.text}</pre>
          <pre>${JSON.stringify(res.summary.query.parameters, null, 2)}</pre>
        </details>
        ${ResultWebView.renderTable(res)}
      </body>
      </html>
    `
  }

  private static renderTable(res: QueryResult) {
    if ( res.records.length === 0 ) {
      return `<p>No results</p>`
    }

    return `
      <table>
        <thead>
        ${res.records[0].keys.map(key => `<th>${key.toString()}</th>`).join('')}
        </thead>
        <tbody>
          ${res.records.map(
    record => this.renderRow(
      record.keys,
                    toNativeTypes(record.toObject()) as any
    )
  ).join('\n')}
        </tbody>
      </table>
    `
  }

  private static renderRow(keys: any[], row: Record<string, any>[]) {
    return `
      <tr>
        ${keys.map(key => {
    return `
          <td>
            <pre>${JSON.stringify(row[key], null, 2)}</pre>
          </td>
          `

  }).join('')}
      </tr>
    `
  }
}
