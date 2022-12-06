const list = `
  query listQuery($typeId: String) {
    mobinets(typeId: $typeId) {
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

const listMobinetTypes = `
  query listMobinetTypeQuery{
    mobinetTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query mobinetsTotalCount{
    mobinetsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listMobinetTypes
};
