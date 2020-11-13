const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const activateInstallation = `
  mutation configsActivateInstallation($token: String!, $hostname: String!) {
    configsActivateInstallation(token: $token, hostname: $hostname)
  }
`;

export default { updateConfigs, activateInstallation };
