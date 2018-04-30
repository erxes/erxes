const configsDetail = `
  query configsDetail($code: String!) {
    configsDetail(code: $code) {
      _id
      code
      value
    }
  }
`;

export default {
  configsDetail
};
