import { gql } from '@apollo/client';

const categoryInputParamDefs = `
  $name: String!,
  $code: String!,
  $description: String,
  $parentId: String,
  $scopeBrandIds: [String],
  $status: String,
  $maskType: String,
  $mask: JSON
`;

const categoryInputParams = `
  name: $name,
  code: $code,
  description: $description,
  parentId: $parentId,
  scopeBrandIds: $scopeBrandIds,
  status: $status,
  maskType: $maskType,
  mask: $mask
`;

export const ACCOUNT_CATEGORIES_ADD = gql`
  mutation accountCategoriesAdd(${categoryInputParamDefs}) {
    accountCategoriesAdd(${categoryInputParams}) {
      _id
    }
  }
`;

export const ACCOUNT_CATEGORIES_EDIT = gql`
  mutation accountCategoriesEdit($_id: String!, ${categoryInputParamDefs}) {
    accountCategoriesEdit(_id: $_id, ${categoryInputParams}) {
      _id
    }
  }
`;

export const ACCOUNT_CATEGORIES_REMOVE = gql`
  mutation accountCategoriesRemove($_id: String!) {
    accountCategoriesRemove(_id: $_id)
  }
`;
