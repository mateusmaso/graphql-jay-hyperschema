import ZSchema from "z-schema"
import $RefParser from 'json-schema-ref-parser'
import {buildClientSchema as graphQLBuildClientSchema} from 'graphql'
import uuid from "uuid"
import traverse from "traverse"
import URITemplateParser from 'uri-template'

var typePropertyMap = {}

export function buildSchema(hyperSchema) {
  // if (!validateHyperSchema(hyperSchema)) {
  //   throw new Error("Can't validate JSON Hyper-Schema (v4)")
  // }

  return $RefParser.dereference(hyperSchema).then((hyperSchema) => {
    var customTypes = customTypesFromHyperSchema(hyperSchema)
    var queryType = queryTypeFromHyperSchema(hyperSchema, customTypes)

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
    })
  })
}

function validateHyperSchema(hyperSchema) {
  var validator = new ZSchema()
  return validator.validateSchema(hyperSchema)
}

function customTypesFromHyperSchema(hyperSchema) {
  var types = []

  traverse(hyperSchema).forEach(function(value) {
    if (value && value.properties && value.title != hyperSchema.title && this.key != "schema") {
      var property = value

      var found = types.find((type) => {
        return type.name == property.title
      })

      if (!found) {
        var name = property.title || `__${uuid.v4().split("-")[0]}`
        var type = {
          "name": name,
          "kind": "OBJECT",
          "fields": [],
          "interfaces": []
        }

        typePropertyMap[name] = property
        types.push(type)
      }
    }
  })

  types.forEach((type) => {
    var property = typePropertyMap[type.name]

    type.fields = Object.keys(property.properties).map((fieldPropertyName) => {
      var fieldProperty = property.properties[fieldPropertyName]
      var links = property.links || []

      var link = links.find((link) => {
        return link.rel == fieldPropertyName
      })

      return parseField(fieldPropertyName, fieldProperty, link, {types})
    })
  })

  return types
}

function queryTypeFromHyperSchema(hyperSchema, types) {
  var queryType = {
    "name": "Query",
    "kind": "OBJECT",
    "fields": [],
    "interfaces": []
  }

  var links = hyperSchema.links || []

  links.forEach((link) => {
    queryType.fields.push(parseField(link.rel, link.targetSchema, link, {types}))
  })

  return queryType
}

function parseField(name, property, link, {types}) {
  var args = []

  if (link) {
    var uriTemplate = URITemplateParser.parse(link.href)

    uriTemplate.expressions.forEach((expression) => {
      expression.params.forEach((param) => {
        if (link.schema) {
          var argProperties = link.schema.properties
          var argProperty = argProperties[param.name]

          args.push({
            name: param.name,
            type: convertType(argProperty, types)
          })
        }
      })
    })
  }

  var type = convertType(property, types)

  return {
    "name": name,
    "args": args,
    "type": type
  }
}

function convertType(property, types) {
  if (property.type == "array") {
    var type = types.find((type) => {
      return property.items == typePropertyMap[type.name]
    })

    if (type) {
      return {
        "kind": "LIST",
        "ofType": {
          "kind": type.kind,
          "name": type.name
        }
      }
    } else {
      return {
        "kind": "LIST",
        "ofType": {
          "kind": "SCALAR",
          "name": "String"
        }
      }
    }
  } else if (property.type == "boolean") {
    return {
      "kind": "SCALAR",
      "name": "Boolean"
    }
  } else if (property.type == "integer") {
    return {
      "kind": "SCALAR",
      "name": "Int"
    }
  } else if (property.type == "number") {
    return {
      "kind": "SCALAR",
      "name": "Float"
    }
  } else if (property.type == "string") {
    return {
      "kind": "SCALAR",
      "name": "String"
    }
  } else if (property.type == "object") {
    var type = types.find((type) => {
      return property == typePropertyMap[type.name]
    })

    return {
      "kind": "OBJECT",
      "name": type.name
    }
  } else {
    return {
      "kind": "SCALAR",
      "name": "String"
    }
  }
}
