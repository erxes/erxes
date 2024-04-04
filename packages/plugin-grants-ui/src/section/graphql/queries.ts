import { userTypes } from '../../common/graohql';

const grantRequest = `
query GrantRequest($contentTypeId: String, $contentType: String) {
  grantRequest(contentTypeId: $contentTypeId, contentType: $contentType) {
    _id
    action
    userIds
    params
    requesterId
    requester{
      ${userTypes}
    }
    status

    users{
      ${userTypes}
    }

  }
}
`;

const grantActions = `
query GetGrantRequestActions {
  getGrantRequestActions {
    action
    label
    scope
  }
}
`;

const checkConfig = `
query CheckGrantActionConfig($contentType: String, $contentTypeId: String, $action: String, $scope: String) {
  checkGrantActionConfig(contentType: $contentType, contentTypeId: $contentTypeId, action: $action, scope: $scope)
}
`;

export default { grantRequest, grantActions, checkConfig };
