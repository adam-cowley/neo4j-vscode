import { QueryResult } from "neo4j-driver"
import { querySummary, toNativeTypes } from "../utils"

export function getLoadingContent(
  cypher: string,
  params: Record<string, any>
) {

  return wrapper(cypher, params, `
    <p>Running query, please wait...</p>
  `)

}

export function getErrorContent(
  cypher: string,
  params: Record<string, any>,
  err: Error
): string {
  return wrapper(cypher, params, `
    <details class="error">
      <summary style="color:red">Error: ${err.message}</summary>
      <pre>${err.stack}</pre>
    </details>
  `)
}

export function getResultContent(
  cypher: string,
  params: Record<string, any>,
  res: QueryResult
) {
  return wrapper(cypher, params, `
    ${renderTable(res)}

    <div class="summary">${querySummary(res).map(str => `<p>${str}</p>`).join('\n')}</div>
  `)
}


function wrapper(cypher: string, params: Record<string, any>, content: string): string {
  return `
    <html>
      <head>
      <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
      <style>
      :root {
        --background: #f2f2f2;
        --border: #ccc;
        --text: #000;
        --error: #ff0000;
      }

      @media (prefers-color-scheme: dark) {
        --background: transparent;
        --border: #ddd;
        --text: #ccc;
        --error: #bbb;
      }

      table{border-collapse:collapse; width: 100%}
      table,td,th{border:1px solid var(--border); padding:5px; vertical-align: top}
      th {font-weight: bold}
      details {margin-bottom: 24px; padding: 12px; border: 1px solid var(--border)}
      details summary {border-bottom: 1px solid var(--border); padding: 6px}
      pre {
        max-height: 280px;
        overflow: auto;
      }

      .error {
        color: var(--border);
        border-color: var(--border);
      }
      </style>
      </head>
      <body>
        <details>
          <summary>Query Details</summary>
          <pre>${cypher}</pre>
          <pre>${JSON.stringify(params, null, 2)}</pre>
        </details>
        ${content}
      </body>
      </html>
    `
}


function renderTable(res: QueryResult) {
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
    record => renderRow(
      record.keys,
                toNativeTypes(record.toObject()) as any
    )
  ).join('\n')}
      </tbody>
    </table>
  `
}

function renderRow(keys: any[], row: Record<string, any>[]) {
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