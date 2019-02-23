const commonParamsDef = `
  $name: String!,
  $description: String,
`;

const commonParams = `
  name: $name,
  description: $description,
`;

const brandAdd = `
  mutation brandsAdd(${commonParamsDef}) {
    brandsAdd(${commonParams}) {
      _id
    }
  }
`;

const brandEdit = `
  mutation brandsEdit($_id: String!, ${commonParamsDef}) {
    brandsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const brandRemove = `
  mutation brandsRemove($_id: String!) {
    brandsRemove(_id: $_id)
  }
`;

const brandManageIntegrations = `
  mutation brandsManageIntegrations($_id: String!, $integrationIds: [String]!) {
    brandsManageIntegrations(_id: $_id, integrationIds: $integrationIds) {
      _id
    }
  }
`;

const brandsConfigEmail = `
  mutation brandsConfigEmail($_id: String!, $emailConfig: JSON) {
    brandsConfigEmail(_id: $_id, emailConfig: $emailConfig) {
      _id
    }
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
  brandAdd,
  brandEdit,
  brandRemove,
  brandsConfigEmail,
  brandManageIntegrations,
  integrationsCreateMessenger,
  integrationsEditMessenger
};
