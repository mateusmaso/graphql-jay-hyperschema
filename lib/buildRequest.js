"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildRequest = buildRequest;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// var requests = [
//   {
//     href: "/users/1",
//     next: [
//       {
//         href: "/users/1/posts",
//         next: [{
//           href: "/users/1",
//           next: []
//         }, {
//           href: "/users/2",
//           next: []
//         }]
//       }
//     ]
//   }
// ]

function buildRequest(schema, ast, url) {
  var requests = [];

  Object.keys(ast).forEach(function (astKey) {
    buildRequests(schema, "root", astKey, ast[astKey], url).forEach(function (request) {
      requests.push(request);
    });
  });

  return requests;
}

function buildRequests(property, astKey, fieldAstKey, ast, url) {
  var requests = [];
  var links = property.links;

  if (property.type == "array") {
    links = property.items.links;
  }

  links.forEach(function (link) {
    if (fieldAstKey == link.rel) {
      requests.push(function (data) {
        var path = link.href;
        var propKeys = path.match(/\{(.*?)\}/g) || [];

        propKeys = propKeys.map(function (key) {
          return key.replace("{", "").replace("}", "");
        });

        propKeys.forEach(function (propKey) {
          var args = Object.assign({}, ast.args, data[astKey]);
          path = path.replace("{" + propKey + "}", args[propKey]);
        });

        // if (link.targetSchema.type == "array") {
        //   console.log(data[astKey])
        //
        //   // .forEach((item) => {
        //   //
        //   // })
        //
        //   // dataList = data[astKey].map((dataItem) => {
        //   //   return {
        //   //     [astKey]: dataItem
        //   //   }
        //   // })
        // } else {
        // }

        return {
          href: "" + url + path,
          resolve: function resolve(response) {
            var next = [];

            Object.keys(ast.fields).forEach(function (_fieldAstKey) {
              console.log(_fieldAstKey);
              // buildRequests(link.targetSchema, fieldAstKey, _fieldAstKey, ast.fields[_fieldAstKey], url).forEach((request) => {
              //   next.push(request)
              // })
            });

            return {
              next: next,
              data: _defineProperty({}, fieldAstKey, response)
            };
          }
        };
      });
    }
  });

  return requests;
}