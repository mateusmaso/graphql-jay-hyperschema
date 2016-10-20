import {buildSchema} from "./buildSchema"
import {transformAST} from "./transformAST"
import {fetchData} from "./fetchData"

let adapter = {
  buildSchema,
  transformAST,
  fetchData
}

export {
  adapter
}
