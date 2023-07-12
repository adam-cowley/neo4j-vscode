# Change Log

All notable changes to the "neo4j-vscode" extension will be documented in this file.

## [0.1.9]

- Added support for Cypher code blocks in Markdown files
- Automatically selects the text within the code block when running a query if no selection is made

```cypher
match (n) return n limit 1
```

[Reference](https://stackoverflow.com/a/76239666/3876654)

## [0.1.8]

- Applied case insensitivity to parameter commands

## [0.1.7]

- If you run the **Neo4j: Add Connection** command with an open .env file containing Neo4j credentials, they will be used to create the new connection.
- Fixed bug when clicking on tree items in newer versions of VS Code

## [0.1.6]

- Fixed bug where database is ignored on current database
- Added a few more Cypher snippets
- Obscure password on addConnection command

## [0.1.5]

- The existing result window will be used when running the same query
- Result window is shown and results & errors are shown asyncronously
- Added `CALL` and `YIELD` to Cypher keywords

## [0.1.4]

- Added additional Cypher snippets for DMBS admin commands
- Added code snippets for Python

## [0.1.2]

- You will now be prompted if you mention any parameters in a query that aren't set in your environment
- Merged [#1](https://github.com/adam-cowley/neo4j-vscode/pull/1/) which adds Cypher grammar and highlighting.  Thanks, [@jakeboone02](https://github.com/jakeboone02)!
- Clicking a connection in the Sidebar will make it the active connection
- You can now remove connections in the Sidebar
- You can now edit and remove parameters from the Sidebar
- Added Snippets for JavaScript & TypeScript
- Refactor & Minor bug fixes
