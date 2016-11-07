"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformAST = transformAST;

var _graphqlJay = require("graphql-jay");

function transformAST(hyperSchema, schema, ast) {
  var ast = (0, _graphqlJay.transformAST)(hyperSchema, schema, ast);

  // TODO: add over-fetching attrs

  return ast;
}