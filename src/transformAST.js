import {transformAST as graphQLJayTransformAST} from "graphql-jay"

export function transformAST(schema, clientSchema, ast) {
  var ast = graphQLJayTransformAST(schema, clientSchema, ast)

  // add over-fetching attrs

  return ast
}
