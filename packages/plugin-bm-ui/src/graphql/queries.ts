const list = `
  query listQuery($typeId: String) {
    bms(typeId: $typeId) {
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

const listBmTypes = `
  query listBmTypeQuery{
    bmTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query bmsTotalCount{
    bmsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listBmTypes
};
