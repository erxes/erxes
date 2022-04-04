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

const managePluginInstall = `
  mutation managePluginInstall($type: String!, $name: String!) {
    configsManagePluginInstall(type: $type, name: $name)
  }
`;

export default { updateConfigs, activateInstallation, managePluginInstall };
