const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

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
  configs,
  list,
  totalCount,
  listSyncpolarisTypes,
};
