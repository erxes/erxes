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

export default { list, totalCount };
