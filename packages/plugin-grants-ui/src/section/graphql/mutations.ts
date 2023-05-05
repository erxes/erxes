const commonParams = `
    $cardId:String;
    $cardType:String;
    $userIds:[String];
    $action:String;
`;
const commonParamsDef = `
    cardId:$cardId;
    cardType:$cardType;
    userIds:$userIds;
    action:$action;
`;

const addGrantRequest = `
    AddGrantRequest(${commonParams}){
        addGrantRequest(${commonParamsDef}){
            userIds,action
        }
    }
`;

export default { addGrantRequest };
