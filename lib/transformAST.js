"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformAST = transformAST;

var _graphqlJay = require("graphql-jay");

function transformAST(schema, clientSchema, ast) {
  var ast = (0, _graphqlJay.transformAST)(schema, clientSchema, ast);

  // add over-fetching attrs

  return ast;
}