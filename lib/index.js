"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adapter = undefined;

var _buildSchema = require("./buildSchema");

var _transformAST = require("./transformAST");

var _fetchData = require("./fetchData");

var adapter = {
  buildSchema: _buildSchema.buildSchema,
  transformAST: _transformAST.transformAST,
  fetchData: _fetchData.fetchData
};

exports.adapter = adapter;