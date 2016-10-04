import query from './query.json';
import user from './user.json';
import userImage from './user-image.json';

let schema = {
  "__schema": {
    "queryType": {
      "name": "Query"
    },
    "types": [query, user, userImage]
  }
};

export default schema;
