const enabledServices = `
  query enabledServices {
    enabledServices
  }
`;

const getInstallationStatus = `
  query configsGetInstallationStatus($name: String!) {
    configsGetInstallationStatus(name: $name)
  }
`;

export default {
  enabledServices,
  getInstallationStatus
};
