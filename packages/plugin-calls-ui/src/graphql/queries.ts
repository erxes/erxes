const list = `
  query listQuery($typeId: String) {
    callss(typeId: $typeId) {
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

const listCallsTypes = `
  query listCallsTypeQuery{
    callsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query callssTotalCount{
    callssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listCallsTypes
};
