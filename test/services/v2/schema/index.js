import user from './user.json'
import post from './post.json'

let schema = {
  "$schema": "http://json-schema.org/draft-04/hyper-schema#",
  "title": "V2",
  "type": "object",
  "definitions": {
    "user": user,
    "post": post
  },
  "properties": {
    "user": {
      "$ref": "#/definitions/user"
    },
    "post": {
      "$ref": "#/definitions/post"
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
    },
    {
      "rel": "post",
      "href": "/posts/{id}",
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
        "$ref": "#/definitions/post"
      }
    }
  ]
}

export default schema
