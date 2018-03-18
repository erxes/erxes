const getConfig = `
  query getConfig($code: String!) {
    getConfig(code: $code) {
      _id
      code
      value
    }
  }
`;

export default {
  getConfig
};
