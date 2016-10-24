import fetch from "isomorphic-fetch"
import URITemplateParser from 'uri-template'
import Bluebird from 'bluebird'
import deepEqual from 'deep-equal'

export function fetchData(schema, ast, url, fetchFn) {
  return resolveFields(ast.fields, schema, {}, url, fetchFn).then((data) => {
    return data
  })
}

function resolveFields(fields, property, parentData, url, fetchFn) {
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

    var relLink = links.find((_link) => {
      return _link.linkRel && _link.linkRel.id == link.id && deepEqual(_link.linkRel.values, astField.args)
    })

    if (relLink) {
      link = relLink
    }

    if (link) {
      requests.push(resolveLink(link, astField.args, parentData, url, fetchFn).then((fieldData) => {
        data[astFieldName] = fieldData

        var targetProperty = link.targetSchema

        if (link.targetSchema.type == "array") {
          targetProperty = link.targetSchema.items
        }

        if (Array.isArray(fieldData)) {
          return batch(fieldData, (fieldItemData, index) => {
            return resolveFields(astField.fields, targetProperty, fieldItemData, url, fetchFn).then((resolvedFieldData) => {
              fieldData[index] = Object.assign(fieldItemData, resolvedFieldData)
            })
          })
        } else {
          return resolveFields(astField.fields, targetProperty, fieldData, url, fetchFn).then((resolvedFieldData) => {
            data[astFieldName] = Object.assign(fieldData, resolvedFieldData)
          })
        }
      }))
    } else {
      var fieldProperty = property.properties[astFieldName]
      var fieldData = parentData[astFieldName]

      if (fieldProperty.type == "array") {
        requests.push(batch(fieldData, (fieldItemData, index) => {
          return resolveFields(astField.fields, fieldProperty.items, fieldItemData, url, fetchFn).then((resolvedFieldData) => {
            fieldData[index] = Object.assign(fieldItemData, resolvedFieldData)
          })
        }))
      } else if (fieldProperty.type == "object") {
        requests.push(resolveFields(astField.fields, fieldProperty, fieldData, url, fetchFn).then((resolvedFieldData) => {
          data[astFieldName] = Object.assign(fieldData, resolvedFieldData)
        }))
      }
    }
  })

  return batch(requests).then(() => {
    return data
  })
}

function resolveLink(link, astFieldArgs, parentData, url, fetchFn) {
  var performFetch = fetchFn || fetch
  var uriTemplate = URITemplateParser.parse(link.href)
  var context = Object.assign({}, astFieldArgs, parentData)

  if (link.each) {
    return batch(context[link.each], (item) => {
      var uri = uriTemplate.expand(Object.assign({}, context, {item}))

      if (!/^[a-zA-Z]+:\/\//.test(uri)) {
        uri = `${url}${uri}`
      }

      return performFetch(uri, {
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

    return performFetch(uri, {
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
