const logs = `
  query logs(
    $start: String,
    $end: String,
    $userId: String,
    $action: String,
    $page: Int,
    $perPage: Int
  ) {
    logs(
      start: $start,
      end: $end,
      userId: $userId,
      action: $action,
      page: $page,
      perPage: $perPage
    ) {
      totalCount
      logs {
        _id
        createdAt
        createdBy
        type
        action
        objectId
        unicode
        oldData
        newData
        description
        addedData
        unchangedData
        changedData
        removedData
        extraDesc
      }
    }
  }
`;

const getDbSchemaLabels = `
  query getDbSchemaLabels($type: String) {
    getDbSchemaLabels(type: $type) {
      name
      label
    }
  }
`;

export default { getDbSchemaLabels, logs };
