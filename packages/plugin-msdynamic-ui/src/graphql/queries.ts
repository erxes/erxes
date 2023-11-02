const dynamicConfigs = `
  query msdynamicConfigs {
    msdynamicConfigs {
      _id
      endPoint
      username
      password
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export default {
  dynamicConfigs,
  configs
};
