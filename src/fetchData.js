import fetch from "isomorphic-fetch"
import URITemplateParser from 'uri-template'
import Bluebird from 'bluebird'

export function fetchData(schema, ast, url) {
  return resolveFields(ast.fields, schema, {}, url).then((data) => {
    return data
  })
}

function resolveFields(fields, property, parentData, url) {
  var data = {}
  var requests = []

  if (Object.keys(fields).length == 0) {
    return Promise.resolve(data)
  }

  Object.keys(fields).forEach((astFieldName) => {
    var astField = fields[astFieldName]
    var links = property.links || []
    var link = links.find((link) => {
      return link.rel == astFieldName
    })

    if (link) {
      requests.push(resolveLink(link, astField.args, parentData, url).then((fieldData) => {
        data[astFieldName] = fieldData

        var targetProperty = link.targetSchema

        if (link.targetSchema.type == "array") {
          targetProperty = link.targetSchema.items
        }

        if (Array.isArray(fieldData)) {
          return batch(fieldData, (fieldItemData, index) => {
            return resolveFields(astField.fields, targetProperty, fieldItemData, url).then((resolvedFieldData) => {
              fieldData[index] = Object.assign(fieldItemData, resolvedFieldData)
            })
          })
        } else {
          return resolveFields(astField.fields, targetProperty, fieldData, url).then((resolvedFieldData) => {
            data[astFieldName] = Object.assign(fieldData, resolvedFieldData)
          })
        }
      }))
    } else {
      var fieldProperty = property.properties[astFieldName]
      var fieldData = parentData[astFieldName]

      if (fieldProperty.type == "array") {
        requests.push(batch(fieldData, (fieldItemData, index) => {
          return resolveFields(astField.fields, fieldProperty.items, fieldItemData, url).then((resolvedFieldData) => {
            fieldData[index] = Object.assign(fieldItemData, resolvedFieldData)
          })
        }))
      } else if (fieldProperty.type == "object") {
        requests.push(resolveFields(astField.fields, fieldProperty, fieldData, url).then((resolvedFieldData) => {
          data[astFieldName] = Object.assign(fieldData, resolvedFieldData)
        }))
      }
    }
  })

  return batch(requests).then(() => {
    return data
  })
}

function resolveLink(link, astFieldArgs, parentData, url) {
  var uriTemplate = URITemplateParser.parse(link.href)
  var context = Object.assign({}, astFieldArgs, parentData)

  if (link.each) {
    return batch(context[link.each], (item) => {
      var uri = uriTemplate.expand(Object.assign({}, context, {item}))

      if (!/^[a-zA-Z]+:\/\//.test(uri)) {
        uri = `${url}${uri}`
      }

      return fetch(uri, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        return response.json()
      })
    })
  } else {
    var uri = uriTemplate.expand(context)

    if (!/^[a-zA-Z]+:\/\//.test(uri)) {
      uri = `${url}${uri}`
    }

    return fetch(uri, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      return response.json()
    })
  }
}

function batch(items, method) {
  var result = []

  return Bluebird.each(items, (item, index) => {
    if (method) {
      return method(item, index).then((response) => {
        result.push(response)
      })
    } else {
      result.push(item)
    }
  }).then(() => {
    return result
  })
}
