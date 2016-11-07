# graphql-jay-hyperschema [![Build Status](https://travis-ci.org/mateusmaso/graphql-jay-hyperschema.svg?branch=master)](https://travis-ci.org/mateusmaso/graphql-jay-hyperschema)

GraphQLJay adapter for JSON Hyper-Schema (draft-04)

## Install

```
$ npm install --save graphql-jay-hyperschema
```

## Usage

```javascript
import {adapter} from "graphql-jay-hyperschema"

export default function service() {  
  var metadata = {
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
    metadata,
    adapter
  }
}
```

## ```LDO``` extra properties

**each**

Use to resolve relations with an unique ```href``` for each item from a target field.

```json
{
  "rel": "urls",
  "href": "{+item}",
  "each": "urls"
}
```

**linkRel**

Use to relate to another ```LDO``` based on ```schema``` values.

```json
{
  "rel": "tatooine",
  "linkRel": {
    "id": "planetWithId",
    "values": {
      "id": "1"
    }
  }
}
```

## License

MIT © [Mateus Maso](http://www.mateusmaso.com)
