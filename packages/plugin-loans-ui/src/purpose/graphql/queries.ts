export const contractTypeFields = `
  _id
  name
  parentId
  code
  description
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $parentId: String
  $searchValue: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  parentId: $parentId
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
