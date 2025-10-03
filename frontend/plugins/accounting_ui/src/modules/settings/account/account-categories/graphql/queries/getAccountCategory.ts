import { gql } from '@apollo/client';

// categories
export const categoryFields = `
  _id
  accountCount
  code
  isRoot
  name
  order
  parentId
`;

const categoryFilterParamDefs = `
  $searchValue: String,
`;

const categoryFilterParams = `
  searchValue: $searchValue,
`;

export const GET_ACCOUNT_CATEGORIES = gql`
  query accountCategories(${categoryFilterParamDefs}) {
    accountCategories(${categoryFilterParams}) {
      ${categoryFields}
    }
  }
`;

export const GET_ACCOUNT_CATEGORY_DETAIL = gql`
  query accountCategoryDetail($id: String!) {
    accountCategoryDetail(_id: $id) {
      ${categoryFields}
    }
  }
`;
