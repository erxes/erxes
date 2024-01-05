const list = `
  query listQuery($typeId: String) {
    syncpolariss(typeId: $typeId) {
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

const listSyncpolarisTypes = `
  query listSyncpolarisTypeQuery{
    syncpolarisTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query syncpolarissTotalCount{
    syncpolarissTotalCount
  }
`;

export default {
  list,
  totalCount,
  listSyncpolarisTypes
};
