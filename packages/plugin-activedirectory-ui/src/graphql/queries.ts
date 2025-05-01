const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl    
    baseDN
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
