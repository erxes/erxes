export const types = `
  type GlobalSearchResultItem {
    id: String!
    title: String!
    description: String
    subTitle: String
    icon: String
    module: String!
    category: String!
    path: String!
    createdAt: Date
    matchFields: JSON
  }

  type CoreModulesGlobalSearchResult {
    list: [GlobalSearchResultItem]
    totalCount: Int
    pageInfo: PageInfo
  }

  type SettingsGlobalSearchResult {
    list: [GlobalSearchResultItem]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  coreModulesGlobalSearch(searchValue: String, module: String, limit: Int, cursor: String, direction: String, orderBy: JSON): CoreModulesGlobalSearchResult
  settingsGlobalSearch(searchValue: String, limit: Int, cursor: String, direction: String, orderBy: JSON): SettingsGlobalSearchResult
`;
