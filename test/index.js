import {expect} from "chai"
import {graphql} from "graphql"
import {composeSchema} from "graphql-jay"
import {v1, v2} from "./services"

var graphQLJaySchema

describe("graphql-jay-hyperschema", () => {
  before(() => {
    return composeSchema(v1, v2).then((schema) => {
      graphQLJaySchema = schema
    }).catch((error) => {
      console.log("Error", error)
    })
  })

  it("should request user", () => {
    return graphql(graphQLJaySchema, `{
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
      console.log("Response", JSON.stringify(response))
      expect(response.data).to.have.keys("user")
    })
  })
})
