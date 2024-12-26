const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl
    localUser
    userDN
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
