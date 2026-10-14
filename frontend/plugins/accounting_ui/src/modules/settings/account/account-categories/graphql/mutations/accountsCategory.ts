import { gql } from '~/gql';

export const ACCOUNT_CATEGORIES_ADD = gql(`
mutation accountingAccountCategoriesAdd($name: String!, $code: String!, $description: String, $parentId: String, $scopeBrandIds: [String], $status: String, $maskType: String, $mask: JSON) {
  accountCategoriesAdd(
    name: $name
    code: $code
    description: $description
    parentId: $parentId
    scopeBrandIds: $scopeBrandIds
    status: $status
    maskType: $maskType
    mask: $mask
  ) {
    _id
  }
}
`);

export const ACCOUNT_CATEGORIES_EDIT = gql(`
mutation accountingAccountCategoriesEdit($_id: String!, $name: String!, $code: String!, $description: String, $parentId: String, $scopeBrandIds: [String], $status: String, $maskType: String, $mask: JSON) {
  accountCategoriesEdit(
    _id: $_id
    name: $name
    code: $code
    description: $description
    parentId: $parentId
    scopeBrandIds: $scopeBrandIds
    status: $status
    maskType: $maskType
    mask: $mask
  ) {
    _id
  }
}
`);

export const ACCOUNT_CATEGORIES_REMOVE = gql(`
mutation accountingAccountCategoriesRemove($_id: String!) {
  accountCategoriesRemove(_id: $_id)
}
`);
