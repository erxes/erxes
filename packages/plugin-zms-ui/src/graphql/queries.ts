const listDictionary = `
query GetDictionaries($parentId: String) {
  getDictionaries(parentId: $parentId) {
    _id
    parentId
    name
    code
    type
    isParent
    createdAt
    createdBy
  }
}
`;
const listZmsLogs = `
  query getZmsLogs($zmsId: String) {
    getZmsLogs(zmsId: $zmsId)
}
`;
const listZmsParent = `
query GetDictionaries($isParent: Boolean = true) {
  getDictionaries(isParent: $isParent) {
    name
    _id
    isParent
  }
}
`;

const totalCount = `
  query zmssTotalCount{
    zmssTotalCount
  }
`;

const listZmss = `
  query GetZmses {
    getZmses {
      _id
      customer {
        o_c_customer_information {
          o_c_customercode
          o_c_customername
          o_c_registerno
        }
      }
    }
  }
`;
const listLogs = `
query getLogs {
  getLogs
}
`;
export default {
  listDictionary,
  totalCount,
  listZmsParent,
  listZmss,
  listLogs,
  listZmsLogs
};
