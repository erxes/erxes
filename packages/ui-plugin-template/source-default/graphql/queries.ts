const list = `
  query listQuery($typeId: String) {
    {name}s(typeId: $typeId) {
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

const list{Name}Types = `
  query list{Name}TypeQuery{
    {name}Types{
      _id
      name
    }
  }
`;

const totalCount = `
  query {name}sTotalCount{
    {name}sTotalCount
  }
`;

export default {
  list,
  totalCount,
  list{Name}Types
};
