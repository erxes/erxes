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
  $isOnline: Boolean
  $branchId: String
  $allowBranchIds: [String]
  $beginNumber: String
  $maxSkipNumber: Int
  $kitchenScreen: JSON
  $waitingScreen: JSON
  $kioskMachine: JSON
  $uiOptions: JSON
  $formSectionTitle: String
  $formIntegrationIds: [String]
  $ebarimtConfig: JSON
  $erkhetConfig: JSON
  $catProdMappings: [CatProdInput]
  $initialCategoryIds: [String]
  $kioskExcludeProductIds: [String]
  $deliveryConfig: JSON
`;

const commonVariables = `
  name: $name,
  description: $description,
  brandId: $brandId
  productDetails: $productDetails
  adminIds: $adminIds
  cashierIds: $cashierIds
  isOnline: $isOnline
  branchId: $branchId
  allowBranchIds: $allowBranchIds
  beginNumber: $beginNumber
  maxSkipNumber: $maxSkipNumber
  kitchenScreen: $kitchenScreen
  waitingScreen: $waitingScreen
  kioskMachine: $kioskMachine
  uiOptions: $uiOptions
  formSectionTitle: $formSectionTitle
  formIntegrationIds: $formIntegrationIds
  ebarimtConfig: $ebarimtConfig
  erkhetConfig: $erkhetConfig
  catProdMappings: $catProdMappings
  initialCategoryIds: $initialCategoryIds
  kioskExcludeProductIds: $kioskExcludeProductIds
  deliveryConfig: $deliveryConfig
`;

const commonPosFields = `
  _id
  name
  description
  createdAt
  integrationId
  productDetails
`;

const posAdd = `
  mutation posAdd(${commonFields}) {
    posAdd(${commonVariables}){
      ${commonPosFields}
    }
  }
`;

const posEdit = `
  mutation posEdit($_id: String, ${commonFields}) {
    posEdit(_id: $_id, ${commonVariables}){
      ${commonPosFields}
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
  mutation brandsAdd($name: String!, $description: String, $emailConfig: JSON,) {
    brandsAdd(name: $name, description: $description, emailConfig: $emailConfig,) {
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
  saveProductGroups,
};
