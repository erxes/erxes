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

const checkActivateInstallation = `
  query configsCheckActivateInstallation($hostname: String!) {
    configsCheckActivateInstallation(hostname: $hostname)
  }
`;

const configsGetEmailTemplate = `
  query configsGetEmailTemplate($name: String) {
    configsGetEmailTemplate(name: $name)
  }
`;

export default {
  configs,
  configsConstants,
  configsGetEnv,
  checkActivateInstallation,
  configsGetEmailTemplate
};
