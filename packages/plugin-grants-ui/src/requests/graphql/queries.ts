import { contentTypeTypes, userTypes } from '../../common/graohql';

const commonParams = `
    $perpage: Int,
    $page: Int,
    $status: String,
    $requesterId: String,
    $userId: String,
    $sortDirection:Int,
    $sortField:String,
    $closedAtFrom: String,
    $closedAtTo: String,
    $createdAtFrom: String,
    $createdAtTo: String,
    $onlyWaitingMe:Boolean
`;

const commonParamsDef = `
    perpage:$perpage,
    page:$page,
    status:$status,
    requesterId:$requesterId,
    userId:$userId,
    sortDirection: $sortDirection
    sortField: $sortField
    closedAtFrom: $closedAtFrom,
    closedAtTo: $closedAtTo,
    createdAtFrom: $createdAtFrom,
    createdAtTo: $createdAtTo,
    onlyWaitingMe:$onlyWaitingMe
`;

const requests = `
query GrantRequests(${commonParams}) {
  grantRequests(${commonParamsDef}) {
    _id
    action
    contentType,
    contentTypeId,
    requesterId,
    status,
    createdAt,
    resolvedAt,
    
    requester {
      ${userTypes}
    }

    users{
      ${userTypes},
    }
    detail
  }
  grantRequestsTotalCount(${commonParamsDef}) 
}
`;

const requestDetail = `
  query GrantRequestDetail($_id: String) {
    grantRequestDetail(_id: $_id) {
      _id
      action,
      actionLabel,
      contentType,
      contentTypeId,
      requesterId,
      status,    
      requester {
        ${userTypes}
      },
      detail,

      responses {
        _id,
        description,
        response,
        createdAt,
        userId,
        user {
          ${userTypes}
        }
      }
    }
  }
`;

export default { requests, requestDetail };
