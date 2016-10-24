'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSchema = buildSchema;

var _jsonSchemaRefParser = require('json-schema-ref-parser');

var _jsonSchemaRefParser2 = _interopRequireDefault(_jsonSchemaRefParser);

var _graphql = require('graphql');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _traverse = require('traverse');

var _traverse2 = _interopRequireDefault(_traverse);

var _uriTemplate = require('uri-template');

var _uriTemplate2 = _interopRequireDefault(_uriTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var typePropertyMap = {};

function buildSchema(hyperSchema) {
  return _jsonSchemaRefParser2.default.dereference(hyperSchema).then(function (hyperSchema) {
    var customTypes = customTypesFromHyperSchema(hyperSchema);
    var queryType = queryTypeFromHyperSchema(hyperSchema, customTypes);

    return (0, _graphql.buildClientSchema)({
      "__schema": {
        "queryType": {
          "name": queryType.name
        },
        "types": [queryType].concat(_toConsumableArray(customTypes))
      }
    });
  });
}

function customTypesFromHyperSchema(hyperSchema) {
  var types = [];

  (0, _traverse2.default)(hyperSchema).forEach(function (value) {
    if (value && value.properties && value.title != hyperSchema.title && this.key != "schema") {
      var property = value;

      var found = types.find(function (type) {
        return type.name == property.title;
      });

      if (!found) {
        var name = property.title || '__' + _uuid2.default.v4().split("-")[0];
        var type = {
          "name": name,
          "kind": "OBJECT",
          "fields": [],
          "interfaces": []
        };

        typePropertyMap[name] = property;
        types.push(type);
      }
    }
  });

  types.forEach(function (type) {
    var property = typePropertyMap[type.name];

    type.fields = Object.keys(property.properties).map(function (fieldPropertyName) {
      var fieldProperty = property.properties[fieldPropertyName];
      var links = property.links || [];

      var links = links.filter(function (link) {
        return link.rel == fieldPropertyName;
      });

      return parseField(fieldPropertyName, fieldProperty, links, { types: types });
    });
  });

  return types;
}

function queryTypeFromHyperSchema(hyperSchema, types) {
  var queryType = {
    "name": "Query",
    "kind": "OBJECT",
    "fields": [],
    "interfaces": []
  };

  Object.keys(hyperSchema.properties).forEach(function (propertyName) {
    var property = hyperSchema.properties[propertyName];
    var links = hyperSchema.links || [];

    var links = links.filter(function (link) {
      return link.rel == propertyName;
    });

    queryType.fields.push(parseField(propertyName, property, links, { types: types }));
  });

  return queryType;
}

function parseField(name, property, links, _ref) {
  var types = _ref.types;

  var args = [];

  links.forEach(function (link) {
    var uriTemplate = _uriTemplate2.default.parse(link.href);

    uriTemplate.expressions.forEach(function (expression) {
      expression.params.forEach(function (param) {
        if (link.schema) {
          var argProperties = link.schema.properties;
          var argProperty = argProperties[param.name];

          args.push({
            name: param.name,
            type: convertType(argProperty, types)
          });
        }
      });
    });
  });

  if (links.length > 0) {
    property = links[0].targetSchema;
  }

  var type = convertType(property, types);

  return {
    "name": name,
    "args": args,
    "type": type
  };
}

function convertType(property, types) {
  if (property.type == "array") {
    var type = types.find(function (type) {
      return property.items == typePropertyMap[type.name];
    });

    if (type) {
      return {
        "kind": "LIST",
        "ofType": {
          "kind": type.kind,
          "name": type.name
        }
      };
    } else {
      return {
        "kind": "LIST",
        "ofType": {
          "kind": "SCALAR",
          "name": "String"
        }
      };
    }
  } else if (property.type == "boolean") {
    return {
      "kind": "SCALAR",
      "name": "Boolean"
    };
  } else if (property.type == "integer") {
    return {
      "kind": "SCALAR",
      "name": "Int"
    };
  } else if (property.type == "number") {
    return {
      "kind": "SCALAR",
      "name": "Float"
    };
  } else if (property.type == "string") {
    return {
      "kind": "SCALAR",
      "name": "String"
    };
  } else if (property.type == "object") {
    var type = types.find(function (type) {
      return property == typePropertyMap[type.name];
    });

    return {
      "kind": "OBJECT",
      "name": type.name
    };
  } else {
    return {
      "kind": "SCALAR",
      "name": "String"
    };
  }
}