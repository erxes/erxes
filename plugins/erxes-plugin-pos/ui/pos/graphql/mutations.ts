const commonFormParamsDef = `
  $name: String!
  $brandId: String!
`;

const commonFormParams = `
  name: $name
  brandId: $brandId
`;

const commonFields = `
    $name: String
    $description: String
    $brandId: String
    $productDetails: [String]
    $adminIds: [String]
    $cashierIds: [String]
    $kitchenScreen: JSON
    $waitingScreen: JSON
    $kioskMachine: JSON
    $formSectionTitle: String
    $formIntegrationIds: [String]
`;

const commonVariables = `
    name: $name,
    description: $description,
    brandId: $brandId
    productDetails: $productDetails
    adminIds: $adminIds
    cashierIds: $cashierIds
    kitchenScreen: $kitchenScreen
    waitingScreen: $waitingScreen
    kioskMachine: $kioskMachine
    formSectionTitle: $formSectionTitle
    formIntegrationIds: $formIntegrationIds
`;

const posAdd = `
  mutation posAdd(${commonFields}) {
    posAdd(${commonVariables}){
      _id
      name
      description
      createdAt
      integrationId
      productDetails
    }
  }
`;

const posEdit = `
  mutation posEdit($_id: String, ${commonFields}) {
    posEdit(_id: $_id, ${commonVariables}){
      _id
      name
      description
      createdAt
      integrationId
      productDetails
    }
  }
`;

const posRemove = `
  mutation posRemove($_id: String!) {
    posRemove(_id: $_id)
  }
`;

const updateConfigs = `
  mutation posConfigsUpdate($posId:String!, $configsMap: JSON!) {
    posConfigsUpdate(posId: $posId, configsMap: $configsMap)
  }
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsArchive = `
  mutation integrationsArchive($_id: String!, $status: Boolean!) {
    integrationsArchive(_id: $_id, status: $status) {
      _id
    }
  }
`;

const integrationsEdit = `
  mutation integrationsEditLeadIntegration($_id: String!, ${commonFormParamsDef}) {
    integrationsEditLeadIntegration(_id: $_id, ${commonFormParams}) {
      _id
      ${commonFields}
    }
  }
`;

const brandAdd = `
  mutation brandsAdd(  $name: String!,
    $description: String,
    $emailConfig: JSON,) {
    brandsAdd(  name: $name,
      description: $description,
      emailConfig: $emailConfig,) {
      _id
    }
  }
`;

const saveProductGroups = `
mutation productGroupsBulkInsert($posId: String, $groups: [GroupInput]) {
  productGroupsBulkInsert(posId: $posId, groups: $groups) {
    _id
  }
}
`;

export default {
  posAdd,
  posEdit,
  posRemove,
  updateConfigs,
  integrationRemove,
  integrationsArchive,
  integrationsEdit,
  brandAdd,
  saveProductGroups
};
