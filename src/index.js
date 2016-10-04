import {buildClientSchema} from "./buildClientSchema";
import {transformAST} from "./transformAST";
import {buildRequest} from "./buildRequest";

let hyperSchemaAdapter = {
  buildClientSchema,
  transformAST,
  buildRequest
}

export {
  hyperSchemaAdapter
}
