const list = `
  query listQuery($typeId: String) {
    tests(typeId: $typeId) {
      _id
      name
      expiryDate
      createdAt
      checked
      typeId
      currentType{
        _id
        name
      }
    }
  }
`;

const listTestTypes = `
  query listTestTypeQuery{
    types{
      _id
      name
    }
  }
`;

const totalCount = `
  query testsTotalCount{
    testsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listTestTypes
};
