import schema from "./schema";
import {hyperSchemaAdapter} from "../../../../graphql-jay-hyperschema/lib";

export default function v2() {
  return {
    schema,
    adapter: hyperSchemaAdapter
  }
};
