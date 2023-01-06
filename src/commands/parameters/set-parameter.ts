import { window } from 'vscode'
import { ParameterType, parameterTypes } from '../../constants'
import ParameterManager from "../../parameters/parameters.manager"

export default async function setParameter(parameters: ParameterManager): Promise<void> {
  const param = await window.showInputBox({
    prompt: "Parameter string",
    placeHolder: "eg. key: string, integer => 1234 or map => {a: 1}",
    ignoreFocusOut: true,
  })
  if (!param) {
    return
  }


  // key => object
  const objectMatch = param.match(/^([a-z0-9\s]+)=>(.*)$/)

  if (objectMatch) {
    console.log('obj', objectMatch)

    const [_all, key, value] = objectMatch

    const type = await window.showQuickPick(parameterTypes, {
      placeHolder: 'What type is this data?'
    })

    await parameters.set(key, value, type as ParameterType)

    return
  }

  // key: string
  const stringMatch = param.match(/^([a-z0-9\s]+):(.*)$/)

  if (stringMatch) {
    console.log('str', stringMatch)
    const [_all, key, value] = stringMatch

    await parameters.set(key.trim(), value)
  }
}
