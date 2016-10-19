import schema from "./schema"
import {adapter} from "../../../lib"

var url = "http://localhost:8080/api/v1"

export default function v1() {
  return {
    url,
    schema,
    adapter
  }
}
