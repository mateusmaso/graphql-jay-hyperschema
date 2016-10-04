import {expect} from "chai";
import {graphql} from "graphql";
import {composeSchema} from "../lib";
import {v1, v2, graph} from "./services";

var graphQLJaySchema;

describe("graphql-jay", () => {
  before(() => {
    return composeSchema(v1, v2, graph).then((schema) => {
      graphQLJaySchema = schema;
    }).catch((error) => {
      console.log("error: ", error);
    });
  });

  it("should request user (v1)", () => {
    graphql(graphQLJaySchema, `{
      user(id: 1) {
        id
        name
      }
    }`).then((response) => {
      console.log("data: ", response.data)
      expect(response.data).to.have.keys("user");
    });
  });

  // it("should request user (v1) + posts (v2)", () => {
  //   graphql(graphQLJaySchema, `{
  //     user(id: 1) {
  //       id
  //       name
  //       posts {
  //         id
  //       }
  //     }
  //   }`).then((response) => {
  //     expect(response.data).to.have.keys("user");
  //   });
  // });
  //
  // it("should request user (v1) + posts (v2) + creator (v2)", () => {
  //   graphql(graphQLJaySchema, `{
  //     user(id: 1) {
  //       id
  //       name
  //       posts {
  //         id
  //         creator {
  //           id
  //           email
  //         }
  //       }
  //     }
  //   }`).then((response) => {
  //     expect(response.data).to.have.keys("user");
  //   });
  // });
  //
  // it("should request user (v1) + posts (v2) + creator (v1) + image (graph)", () => {
  //   graphql(graphQLJaySchema, `{
  //     user(id: 1) {
  //       id
  //       name
  //       posts {
  //         id
  //         creator {
  //           id
  //           image {
  //             small
  //           }
  //         }
  //       }
  //     }
  //   }`).then((response) => {
  //     expect(response.data).to.have.keys("user");
  //   });
  // });
});
