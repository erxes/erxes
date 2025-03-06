const list = `
  query listQuery($typeId: String) {
    activities(typeId: $typeId) {
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

const listActivityTypes = `
  query listActivityTypeQuery{
    activityTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query activitiesTotalCount{
    activitiesTotalCount
  }
`;

export default {
  list,
  totalCount,
  listActivityTypes
};
