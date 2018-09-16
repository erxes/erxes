const insertConfig = `
  mutation configsInsert($code: String!, $value: [String]!) {
    configsInsert(code: $code, value: $value) {
      _id
    }
  }
`;

export default { insertConfig };
