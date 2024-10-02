const list = `
  query listQuery($typeId: String) {
    pmss(typeId: $typeId) {
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

const listPmsTypes = `
  query listPmsTypeQuery{
    pmsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query pmssTotalCount{
    pmssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listPmsTypes
};
