export const contractTypeFields = `
  _id
  name
  parentId
  code
  order
  isRoot
  description
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $hasParentId: Boolean
  $searchValue: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  hasParentId: $hasParentId
  searchValue: $searchValue
`;

export const purposes = `
  query purposesMain(${listParamsDef}) {
    purposesMain(${listParamsValue}) {
      list { ${contractTypeFields} }
      totalCount
    }
  }
`;

export default {
  purposes,
};
