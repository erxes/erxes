const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl
    isLocalUser
    userDN
    baseDN
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
