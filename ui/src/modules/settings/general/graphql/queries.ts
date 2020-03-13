const configs = `
  query configs {
    configs {
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
  configs,
  configsGetEnv
};
