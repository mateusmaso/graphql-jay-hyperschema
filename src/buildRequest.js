export function buildRequest(schema, ast) {
  return {
    href: `${url}?query=${buildQuery(ast)}`
  }
}
