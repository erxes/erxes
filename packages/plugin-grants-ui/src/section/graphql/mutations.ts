const commonParams = `
    $cardId:String,
    $cardType:String,
    $userIds:[String],
    $action:String,
    $params:String,
    $requesterId:String,
`;
const commonParamsDef = `
    cardId:$cardId,
    cardType:$cardType,
    userIds:$userIds,
    action:$action,
    params:$params,
    requesterId:$requesterId
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

export default { addGrantRequest, editGrantRequest, cancelRequest };
