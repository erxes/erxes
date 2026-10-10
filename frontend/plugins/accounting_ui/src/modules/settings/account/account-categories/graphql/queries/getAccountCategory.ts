import { gql } from '~/gql';

// categories

export const GET_ACCOUNT_CATEGORIES = gql(`
query accountingAccountCategories($searchValue: String) {
  accountCategories(searchValue: $searchValue) {
    _id
    accountCount
    code
    isRoot
    name
    order
    parentId
  }
}
`);

export const GET_ACCOUNT_CATEGORY_DETAIL = gql(`
query accountingAccountCategoryDetail($id: String!) {
  accountCategoryDetail(_id: $id) {
    _id
    accountCount
    code
    isRoot
    name
    order
    parentId
  }
}
`);
