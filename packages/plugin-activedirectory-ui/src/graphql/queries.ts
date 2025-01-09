const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl
    isLocalUser
    userDN
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
