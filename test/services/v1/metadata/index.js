import user from './user.json'

let schema = {
  "$schema": "http://json-schema.org/draft-04/hyper-schema#",
  "title": "V1",
  "type": "object",
  "definitions": {
    "user": user
  },
  "properties": {
    "user": {
      "$ref": "#/definitions/user"
    }
  },
  "links": [
    {
      "rel": "user",
      "href": "/users/{id}",
      "method": "GET",
      "schema": {
        "type": "object",
        "properties": {
          "id": {
            "type": "number"
          }
        }
      },
      "targetSchema": {
        "$ref": "#/definitions/user"
      }
    }
  ]
}

export default schema
