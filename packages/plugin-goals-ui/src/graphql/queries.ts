const list = `
  query listQuery($typeId: String) {
    goalss(typeId: $typeId) {
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

const listGoalsTypes = `
  query listGoalsTypeQuery{
    goalsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query goalssTotalCount{
    goalssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listGoalsTypes
};
