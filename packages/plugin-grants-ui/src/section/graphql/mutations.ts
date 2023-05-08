const commonParams = `
    $cardId:String,
    $cardType:String,
    $userIds:[String],
    $action:String,
    $params:String,
`;
const commonParamsDef = `
    cardId:$cardId,
    cardType:$cardType,
    userIds:$userIds,
    action:$action,
    params:$params,
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
mutation CancelGrantRequest($cardId: String, $cardType: String) {
  cancelGrantRequest(cardId: $cardId, cardType: $cardType)
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
