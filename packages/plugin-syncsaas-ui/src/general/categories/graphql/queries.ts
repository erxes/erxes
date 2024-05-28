const categories = `
  query SyncedSaasCategories($ids:[String],$excludeIds:[String],$searchValue: String) {
    syncedSaasCategories(ids:$ids,excludeIds:$excludeIds,searchValue: $searchValue) {
        _id
        code
        description
        name
        order
        isRoot,
        count
    }
  }
`;

const categoriesTotalCount = `
  query SyncedSaasCategoriesTotalCount($searchValue: String) {
    syncedSaasCategoriesTotalCount(searchValue: $searchValue)
  }
`;

export default { categories, categoriesTotalCount };
