const rcfaDetail = `
  query rcfaDetail($_id: String, $mainType: String, $mainTypeId: String) {
    rcfaDetail(_id: $_id, mainType: $mainType, mainTypeId: $mainTypeId){
    _id
    mainType
    mainTypeId
    relType
    relTypeId
    status
    createdAt
    userId
    closedAt
    issues {
      _id
      rcfaId
      issue
      createdAt
      parentId
      status
      relType
      relTypeId
      description
      isRootCause
    }
    }
  }
`;

const rcfaList = `
query RcfaList($mainType: String, $searchValue: String, $page: Int, $perPage: Int, $createdAtFrom: String, $createdAtTo: String, $closedAtFrom: String, $closedAtTo: String, $status: String) {
  rcfaList(mainType: $mainType, searchValue: $searchValue, page: $page, perPage: $perPage, createdAtFrom: $createdAtFrom, createdAtTo: $createdAtTo, closedAtFrom: $closedAtFrom, closedAtTo: $closedAtTo, status: $status) {
    list {
      _id
      mainType
      mainTypeId
      relType
      relTypeId
      status
      createdAt
      userId
      closedAt
    }
    totalCount
  }
}
`;

export default {
  rcfaDetail,
  rcfaList
};
