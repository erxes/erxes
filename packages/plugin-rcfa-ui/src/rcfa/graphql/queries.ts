const cardTypes = `_id, name `;

const commonFields = `
      _id
      mainType
      mainTypeId

      mainTypeDetail{
        ${cardTypes}
      }

      relType
      relTypeId

      relTypeDetail {
        ${cardTypes}
      }

      status
      createdAt
      userId
      closedAt
`;

const commonIssueFields = `
      _id
      rcfaId
      issue
      createdAt
      parentId
      status
      taskIds
      description
      isRootCause
`;

const listParams = `
  $mainType: String,
  $searchValue: String,
  $page: Int,
  $perPage: Int,
  $createdAtFrom: String,
  $createdAtTo: String,
  $closedAtFrom: String,
  $closedAtTo: String,
  $status: String
`;

const listParamsDef = `
  mainType: $mainType,
  searchValue: $searchValue,
  page: $page,
  perPage: $perPage,
  createdAtFrom: $createdAtFrom,
  createdAtTo: $createdAtTo,
  closedAtFrom: $closedAtFrom,
  closedAtTo: $closedAtTo,
  status: $status
`;

const rcfaDetail = `
  query rcfaDetail($_id: String, $mainType: String, $mainTypeId: String) {
    rcfaDetail(_id: $_id, mainType: $mainType, mainTypeId: $mainTypeId){

    ${commonFields}

    issues {
      ${commonIssueFields}
    }
    }
  }
`;

const rcfaList = `
query RcfaList(${listParams}) {
  rcfaList(${listParamsDef}) {
    list {
      ${commonFields}
    }
    totalCount
  }
}
`;

export default {
  rcfaDetail,
  rcfaList
};
