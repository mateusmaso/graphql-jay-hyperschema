import metadata from "./metadata"
import {adapter} from "../../../lib"

var url = "http://localhost:8080/api/v2"

export default function v2() {
  return {
    url,
    metadata,
    adapter
  }
}
