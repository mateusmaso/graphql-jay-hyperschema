import user from './user.json';

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
  }
};

export default schema;
