const commonParams = `
    $searchValue: String,
    $dateFilters: JSON
`;

const commonParamsDef = `
    searchValue: $searchValue,
    dateFilters: $dateFilters
`;

const list = `
query SyncedSaasList(${commonParams}) {
  syncedSaasList(${commonParamsDef}) {
    _id
    name
    description
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
    subdomain
    appToken
    startDate
    expireDate
    config
  }
}
`;

export default { list, totalCount, detail };
