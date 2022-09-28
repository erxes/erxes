const list = `
  query listQuery($typeId: String) {
    tumentechs(typeId: $typeId) {
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

const listTumentechTypes = `
  query listTumentechTypeQuery{
    tumentechTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query tumentechsTotalCount{
    tumentechsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listTumentechTypes
};
