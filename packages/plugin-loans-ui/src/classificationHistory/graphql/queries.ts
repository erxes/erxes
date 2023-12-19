const periodLockFields = `
  list {
    _id
    description
    invDate
    total
    classification
    newClassification
  }
  totalCount
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $searchValue: String
 
  $sortField: String
  $sortDirection: Int
  `;

const listParamsValue = `
  page: $page
  perPage: $perPage
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const classifications = `
  query Classifications(${listParamsDef}) {
    classifications(${listParamsValue}) {
      ${periodLockFields}
    }
  }
`;

export default {
  classifications
};
