import { contentTypeTypes, userTypes } from '../../common/graohql';

const commonParams = `
    $perpage: Int,
    $page: Int,
    $status: String,
    $requesterId: String,
    $userId: String,
`;

const commonParamsDef = `
    perpage:$perpage,
    page:$page,
    status:$status,
    requesterId:$requesterId,
    userId:$userId,
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
    
    requester {
      ${userTypes}
    }

    users{
      ${userTypes},
    }
    ${contentTypeTypes}
  }
  grantRequestsTotalCount(${commonParamsDef}) 
}
`;

const requestDetail = `
  query GrantRequestDetail($_id: String) {
    grantRequestDetail(_id: $_id) {
      _id
      action
      contentType,
      contentTypeId,
      requesterId,
      status,    
      requester {
        ${userTypes}
      },
      ${contentTypeTypes},

      responses {
        _id,
        description,
        response,
        userId,
        user {
          ${userTypes}
        }
      }
    }
  }
`;

export default { requests, requestDetail };
