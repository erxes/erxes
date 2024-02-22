const integrationsGetClaimedPhoneOrders = `
  query integrationsGetClaimedPhoneOrders {
    integrationsGetClaimedPhoneOrders
  }
`;

const integrationsGetAvailablePhones = `
  query integrationsGetAvailablePhones($countryCode: String!, $regionCode: String) {
    integrationsGetAvailablePhones(countryCode: $countryCode, regionCode: $regionCode)
  }
`;

const configsGetEmailTemplate = `
  query configsGetEmailTemplate($name: String) {
    configsGetEmailTemplate(name: $name)
  }
`;

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
  }
`;

export default {
  integrationsGetClaimedPhoneOrders,
  integrationsGetAvailablePhones,
  configsGetEmailTemplate,
  configs,
};
