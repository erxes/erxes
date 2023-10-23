const list = `
  query listQuery($typeId: String) {
    reportss(typeId: $typeId) {
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

const listReportsTypes = `
  query listReportsTypeQuery{
    reportsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query reportssTotalCount{
    reportssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listReportsTypes
};
