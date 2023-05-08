const commonParams = `
    $perpage: Int,
    $page: Int,
    $status: String,
`;

const commonParamsDef = `
    perpage:$perpage,
    page:$page,
    status:$status
`;

const requests = `
query GrantRequests(${commonParams}) {
  grantRequests(${commonParamsDef}) {
    _id
    action
    requesterId
    status
  }
  grantRequestsTotalCount(${commonParamsDef}) 
}
`;

export default { requests };
