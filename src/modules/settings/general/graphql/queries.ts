const configsDetail = `
  query configsDetail($code: String!) {
    configsDetail(code: $code) {
      _id
      code
      value
    }
  }
`;

const configsGetEnv = `
  query configsGetEnv {
    configsGetEnv {
      USE_BRAND_RESTRICTIONS
    }
  }
`;

export default {
  configsDetail,
  configsGetEnv
};
