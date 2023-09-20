const commonParams = `
    $searchValue: String,
    $dateFilters: JSON
    $categoryId: String
`;

const commonParamsDef = `
    searchValue: $searchValue,
    dateFilters: $dateFilters,
    categoryId:$categoryId
`;

const list = `
query SyncedSaasList(${commonParams}) {
  syncedSaasList(${commonParamsDef}) {
    _id
    name
    description
    categoryId
    subdomain
    appToken
    startDate
    expireDate
  }
}
`;

const totalCount = `
query SyncedSaasListTotalCount(${commonParams}) {
  syncedSaasListTotalCount(${commonParamsDef})
}
`;

const detail = `
query SyncedSaasDetail($_id: String!) {
  SyncedSaasDetail(_id: $_id) {
    _id
    name
    description
    categoryId
    subdomain
    appToken
    startDate
    expireDate
    config,
    checkApproved
  }
}
`;

export default { list, totalCount, detail };
