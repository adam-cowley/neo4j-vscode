import { int } from 'neo4j-driver'
import * as vscode from 'vscode'
import {
  PARAMETERS,
  ParameterType,
  PARAMETER_TYPE_FLOAT,
  PARAMETER_TYPE_INT,
  PARAMETER_TYPE_NULL,
  PARAMETER_TYPE_OBJECT,
  PARAMETER_TYPE_STRING,
} from '../constants'
import ParameterTreeProvider from './parameter-tree.provider'

export interface Parameter {
  key: string;
  value: string;
  type: ParameterType;
}

function convertParameter(parameter: Parameter): [string, any] {
  switch (parameter.type) {
  case PARAMETER_TYPE_NULL:
    return [ parameter.key, null ]
  case PARAMETER_TYPE_INT:
    return [ parameter.key, int(parameter.value) ]
  case PARAMETER_TYPE_FLOAT:
    return [ parameter.key, parseFloat(parameter.value) ]
  case PARAMETER_TYPE_OBJECT:
    return [ parameter.key, JSON.parse(parameter.value) ]
  default:
    return [ parameter.key, parameter.value ]
  }
}

export default class ParameterManager {
  private readonly tree: ParameterTreeProvider

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {
    this.tree = new ParameterTreeProvider(context, this)
  }

  getTreeProvider(): ParameterTreeProvider {
    return this.tree
  }

  getState(): Record<string, Parameter> {
    return this.context.globalState.get(PARAMETERS) || {}
  }

  has(key: string): boolean {
    const state = this.getState()

    return state.hasOwnProperty(key)
  }

  clear(): Promise<void> {
    return this.updateState({})
  }

  async updateState(state: Record<string, Parameter>) {
    await this.context.globalState.update(PARAMETERS, state)

    this.tree.refresh()
  }

  async asParameters(): Promise<Record<string, any>> {
    const parameters = this.getState()

    return Object.fromEntries(
      Object.values(parameters)
        .map((param: Parameter) => convertParameter(param))
    )
  }

  async keys(): Promise<string[]> {
    const parameters = this.getState()

    return Object.keys(parameters)
  }

  async set(key: string, value: any, type: ParameterType = PARAMETER_TYPE_STRING) {
    const parameters = this.getState()

    parameters[ key.trim() ] = { key: key.trim(), value, type }

    await this.updateState(parameters)

    vscode.window.showInformationMessage(`Parameter \`${key}\` set.`)
  }

  async remove(key: string) {
    const parameters = this.getState()

    delete parameters[ key ]

    await this.updateState(parameters)

    vscode.window.showInformationMessage(`Parameter \`${key}\` removed.`)
  }
}
