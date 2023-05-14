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

export default { grantRequest, grantActions };
