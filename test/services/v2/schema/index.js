import user from './user.json';
import post from './post.json';

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
  }
};

export default schema;
