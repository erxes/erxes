const list = `
  query listQuery($typeId: String) {
    programs(typeId: $typeId) {
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

const listProgramTypes = `
  query listProgramTypeQuery{
    programTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query programsTotalCount{
    programsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listProgramTypes,
};
