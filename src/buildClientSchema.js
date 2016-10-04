import ZSchema from "z-schema";
import camelCase from 'camelcase';
import pascalCase from 'pascalcase';
import $RefParser from 'json-schema-ref-parser';
import {buildClientSchema as graphQLBuildClientSchema} from 'graphql';

var typePropertyMap = {};

export function buildClientSchema(hyperSchema) {
  if (!validateHyperSchema(hyperSchema)) {
    throw new Error("Can't validate JSON Hyper-Schema (v4)");
  }

  return $RefParser.dereference(hyperSchema).then((hyperSchema) => {
    var customTypes = customTypesFromHyperSchema(hyperSchema);
    var queryType = queryTypeFromHyperSchema(hyperSchema, customTypes);

    return graphQLBuildClientSchema({
      "__schema": {
        "queryType": {
          "name": queryType.name
        },
        "types": [
          queryType,
          ...customTypes
        ]
      }
    });
  });
}

function validateHyperSchema(hyperSchema) {
  var validator = new ZSchema();
  return validator.validateSchema(hyperSchema);
}

function customTypesFromHyperSchema(hyperSchema) {
  var types = Object.keys(hyperSchema.properties).map((propertyName) => {
    var property = hyperSchema.properties[propertyName];
    var name = pascalCase(propertyName);
    var type = {
      "name": name,
      "kind": "OBJECT",
      "fields": [],
      "interfaces": []
    };

    typePropertyMap[name] = property;

    return type;
  });

  types.forEach((type) => {
    type.fields = typeFields(type, {types});
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

  types.forEach((type) => {
    queryType.fields = queryType.fields.concat(queryTypeFields(type, {types}));
  });

  return queryType;
}

// TODO: add links that rel != "self"
function typeFields(type, {types}) {
  var property = typePropertyMap[type.name];

  return Object.keys(property.properties).map((fieldPropertyName) => {
    var fieldProperty = property.properties[fieldPropertyName];
    var field = parseField(fieldPropertyName, fieldProperty, {types});
    return field;
  });
}

function queryTypeFields(type, {types}) {
  var property = typePropertyMap[type.name];

  return property.links.filter((link) => {
    return link.rel == "self" && link.method == "GET";
  }).map((link) => {
    var field = parseField(camelCase(type.name), link.targetSchema, {types});
    return field;
  });
}

function parseField(name, property, {types}) {
  var typeKind, typeName, typeOfType;
  var links = [];

  if (property.type == "array") {
    var type = types.find((type) => {
      return property.items == typePropertyMap[type.name];
    });

    typeKind = "LIST";
    typeOfType = {
      kind: 'OBJECT',
      name: type.name
    };
  } else if (property.type == "boolean") {
    typeKind = "SCALAR"
    typeName = "Boolean";
  } else if (property.type == "integer") {
    typeKind = "SCALAR";
    typeName = "Int";
  } else if (property.type == "number") {
    typeKind = "SCALAR";
    typeName = "Float";
  } else if (property.type == "string") {
    typeKind = "SCALAR";
    typeName = "String";
  } else if (property.type == "object") {
    var type = types.find((type) => {
      return property == typePropertyMap[type.name];
    });

    typeKind = "OBJECT";
    typeName = type.name;
  }

  return {
    "name": name,
    "args": [],
    "type": {
      "kind": typeKind,
      "name": typeName,
      "ofType": typeOfType
    },
    "links": links
  }
}
