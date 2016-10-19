# graphql-jay-hyperschema

GraphQLJay adapter for JSON Hyper-Schema (draft-04)

## Install

```
$ npm install --save graphql-jay-hyperschema
```

## Usage

```javascript
import {adapter} from "graphql-jay-hyperschema"

export default function myService() {  
  var schema = {
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "type": "object",
    "definitions": {
      "user": {
        "type": "object",
        "properties": {...},
        "required": [...],
        "links": [...]
      }
    },
    "properties": {
      "user": {
        "$ref": "#/definitions/user"
      }
    },
    "links": [{
      "rel": "user",
      "href": "/users/{id}",
      "schema": {
        "type": "object",
        "properties": {
          "id": {
            "type": "number"
          }
        },
        "required": ["id"]
      },
      "targetSchema": {
        "$ref": "#/definitions/user"
      }
    }]
  }

  return {
    schema,
    adapter
  }
}
```
