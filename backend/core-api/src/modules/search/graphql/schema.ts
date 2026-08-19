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

  type PluginsGlobalSearchResult {
    list: [GlobalSearchResultItem]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  coreModulesGlobalSearch(searchValue: String, limit: Int, cursor: String, direction: String): CoreModulesGlobalSearchResult
  settingsGlobalSearch(searchValue: String, limit: Int, cursor: String, direction: String): SettingsGlobalSearchResult
  pluginsGlobalSearch(searchValue: String, limit: Int, cursor: String, direction: String): PluginsGlobalSearchResult
`;
