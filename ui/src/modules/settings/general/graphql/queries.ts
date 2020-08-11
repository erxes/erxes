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

const configsConstants = `
  query configsConstants {
    configsConstants
  }
`;
export default {
  configs,
  configsConstants,
  configsGetEnv
};
