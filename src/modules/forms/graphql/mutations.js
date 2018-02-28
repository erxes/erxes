// const commonParamsDef = `
//   $name: String,
//   $description: String,
// `;
//
// const commonParams = `
//   name: $name,
//   description: $description,
// `;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsCreateMessenger = `
  mutation add($name: String!, $brandId: String!) {
    integrationsCreateMessengerIntegration(
      name: $name
      brandId: $brandId
    ) {
      _id
    }
  }
`;

const integrationsEditMessenger = `
  mutation edit($_id: String!, $name: String!, $brandId: String!) {
    integrationsEditMessengerIntegration(
      _id: $_id
      name: $name
      brandId: $brandId
    ) {
       _id
    }
  }
`;

export default {
  integrationRemove,
  integrationsCreateMessenger,
  integrationsEditMessenger
};
