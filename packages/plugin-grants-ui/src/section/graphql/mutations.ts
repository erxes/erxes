const commonParams = `
    $contentTypeId:String,
    $contentType:String,
    $userIds:[String],
    $action:String,
    $params:String,
    $scope:String
`;
const commonParamsDef = `
    contentTypeId:$contentTypeId,
    contentType:$contentType,
    userIds:$userIds,
    action:$action,
    params:$params,
    scope:$scope
`;

const addGrantRequest = `
    mutation AddGrantRequest(${commonParams}){
        addGrantRequest(${commonParamsDef})
    }
`;

const editGrantRequest = `
    mutation EditGrantRequest(${commonParams}){
        editGrantRequest(${commonParamsDef})
    }
`;

const cancelRequest = `
mutation CancelGrantRequest($contentTypeId: String, $contentType: String) {
  cancelGrantRequest(contentTypeId: $contentTypeId, contentType: $contentType)
}
`;

const responseGrantRequest = `
mutation ResponseGrantRequest($description: String, $response: String, $requestId: String) {
  responseGrantRequest(description: $description, response: $response, requestId: $requestId)
}
`;

export default {
  addGrantRequest,
  editGrantRequest,
  cancelRequest,
  responseGrantRequest
};
