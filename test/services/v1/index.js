import schema from "./schema";
import {hyperSchemaAdapter} from "../../../../graphql-jay-hyperschema/lib";

export default function v1() {
  return {
    schema,
    adapter: hyperSchemaAdapter
  }
};
