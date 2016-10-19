"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adapter = undefined;

var _buildClientSchema = require("./buildClientSchema");

var _transformAST = require("./transformAST");

var _fetchData = require("./fetchData");

var adapter = {
  buildClientSchema: _buildClientSchema.buildClientSchema,
  transformAST: _transformAST.transformAST,
  fetchData: _fetchData.fetchData
};

exports.adapter = adapter;