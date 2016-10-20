import {expect} from "chai"
import {graphql} from "graphql"
import {composeSchema} from "graphql-jay"
import {v1, v2} from "./services"

describe("graphql-jay-hyperschema", () => {
  var schema

  before(() => {
    return composeSchema(v1, v2).then((_) => {
      schema = _
    }).catch((error) => {
      console.warn(error)
    })
  })

  it("should request user", () => {
    return graphql(schema, `{
      user(id: 1) {
        id
        name
        email
        posts {
          title
          creator {
            id
          }
        }
      }
    }`).then((response) => {
      console.log(JSON.stringify(response))
      expect(response.data).to.have.keys("user")
    })
  })
})
