const commonParamsDef = `
  $name: String,
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

export default {
  brandAdd,
  brandEdit,
  brandRemove,
  brandManageIntegrations
};
