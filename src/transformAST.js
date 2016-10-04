import clone from 'clone';

export function transformAST(schema, ast) {
  ast = clone(ast);

  var reduceAST = (type, fields) => {
    Object.keys(fields).forEach((fieldName) => {
      var field = fields[fieldName];
      var typeField = type.getFields()[fieldName];

      if (!typeField) {
        delete fields[fieldName];
      } else {
        reduceAST(typeField.type, field.fields);
      }
    });
  };

  reduceAST(schema.getQueryType(), ast);

  return ast;
}
