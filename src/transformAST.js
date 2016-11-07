import {transformAST as graphQLJayTransformAST} from "graphql-jay"

export function transformAST(hyperSchema, schema, ast) {
  var ast = graphQLJayTransformAST(hyperSchema, schema, ast)

  // TODO: add over-fetching attrs

  return ast
}
