import {buildClientSchema} from "./buildClientSchema"
import {transformAST} from "./transformAST"
import {fetchData} from "./fetchData"

let adapter = {
  buildClientSchema,
  transformAST,
  fetchData
}

export {
  adapter
}
