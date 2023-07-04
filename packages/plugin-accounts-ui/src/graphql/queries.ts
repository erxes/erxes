import { queries as accountQueries } from '@erxes/ui-accounts/src/graphql';

const accountCategories = accountQueries.accountCategories;

const accounts = accountQueries.accounts;

const accountCountByTags = `
  query accountCountByTags {
    accountCountByTags
  }
`;

const accountCategoriesCount = `
  query accountCategoriesTotalCount {
    accountCategoriesTotalCount
  }
`;

const accountsGroupCounts = `
  query accountsGroupCounts(
    $segment: String,
    $segmentData: String,
    $only: String
  ) {
    accountsGroupCounts(
      segment: $segment,
      segmentData: $segmentData,
      only: $only
    )
  }
`;

const accountsCount = `
  query accountsTotalCount($type: String, $segment: String, $segmentData: String) {
    accountsTotalCount(type: $type, segment: $segment, segmentData: $segmentData)
  }
`;

const accountDetail = accountQueries.accountDetail;

const accountCategoryDetail = `
  query accountCategoryDetail($_id: String) {
    accountCategoryDetail(_id: $_id) {
      _id
      name
      accountCount
    }
  }
`;

// account documents
const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

export default {
  accounts,
  accountDetail,
  accountsCount,
  accountsGroupCounts,
  accountCountByTags,
  accountCategories,
  accountCategoriesCount,
  accountCategoryDetail,
  documents
};
