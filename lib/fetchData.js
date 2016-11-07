'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchData = fetchData;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _uriTemplate = require('uri-template');

var _uriTemplate2 = _interopRequireDefault(_uriTemplate);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchData(hyperSchema, ast, url, fetchFn) {
  return resolveFields(ast.fields, hyperSchema, {}, url, fetchFn).then(function (data) {
    return data;
  });
}

function resolveFields(fields, property, parentData, url, fetchFn) {
  var data = {};
  var requests = [];

  if (Object.keys(fields).length == 0) {
    return Promise.resolve(data);
  }

  Object.keys(fields).forEach(function (astFieldName) {
    var astField = fields[astFieldName];
    var links = property.links || [];
    var link = links.find(function (link) {
      return link.rel == astFieldName;
    });

    var relLink = links.find(function (_link) {
      return _link.linkRel && _link.linkRel.id == link.id && (0, _deepEqual2.default)(_link.linkRel.values, astField.args);
    });

    if (relLink) {
      link = relLink;
    }

    if (link) {
      requests.push(resolveLink(link, astField.args, parentData, url, fetchFn).then(function (fieldData) {
        data[astFieldName] = fieldData;

        var targetProperty = link.targetSchema;

        if (link.targetSchema.type == "array") {
          targetProperty = link.targetSchema.items;
        }

        if (Array.isArray(fieldData)) {
          return batch(fieldData, function (fieldItemData, index) {
            return resolveFields(astField.fields, targetProperty, fieldItemData, url, fetchFn).then(function (resolvedFieldData) {
              fieldData[index] = Object.assign(fieldItemData, resolvedFieldData);
            });
          });
        } else {
          return resolveFields(astField.fields, targetProperty, fieldData, url, fetchFn).then(function (resolvedFieldData) {
            data[astFieldName] = Object.assign(fieldData, resolvedFieldData);
          });
        }
      }));
    } else {
      var fieldProperty = property.properties[astFieldName];
      var fieldData = parentData[astFieldName];

      if (fieldProperty.type == "array") {
        requests.push(batch(fieldData, function (fieldItemData, index) {
          return resolveFields(astField.fields, fieldProperty.items, fieldItemData, url, fetchFn).then(function (resolvedFieldData) {
            fieldData[index] = Object.assign(fieldItemData, resolvedFieldData);
          });
        }));
      } else if (fieldProperty.type == "object") {
        requests.push(resolveFields(astField.fields, fieldProperty, fieldData, url, fetchFn).then(function (resolvedFieldData) {
          data[astFieldName] = Object.assign(fieldData, resolvedFieldData);
        }));
      }
    }
  });

  return batch(requests).then(function () {
    return data;
  });
}

function resolveLink(link, astFieldArgs, parentData, url, fetchFn) {
  var performFetch = fetchFn || _isomorphicFetch2.default;
  var uriTemplate = _uriTemplate2.default.parse(link.href);
  var context = Object.assign({}, astFieldArgs, parentData);

  if (link.each) {
    return batch(context[link.each], function (item) {
      var uri = uriTemplate.expand(Object.assign({}, context, { item: item }));

      if (!/^[a-zA-Z]+:\/\//.test(uri)) {
        uri = '' + url + uri;
      }

      return performFetch(uri, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function (response) {
        return response.json();
      });
    });
  } else {
    var uri = uriTemplate.expand(context);

    if (!/^[a-zA-Z]+:\/\//.test(uri)) {
      uri = '' + url + uri;
    }

    return performFetch(uri, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      return response.json();
    });
  }
}

function batch(items, method) {
  var result = [];

  return _bluebird2.default.each(items, function (item, index) {
    if (method) {
      return method(item, index).then(function (response) {
        result.push(response);
      });
    } else {
      result.push(item);
    }
  }).then(function () {
    return result;
  });
}