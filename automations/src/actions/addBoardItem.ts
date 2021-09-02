import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addBoardItem = async ({ action, execution, type }) => {
    const newData = await replacePlaceHolders({ actionData: action.config, target: execution.target });

    if (execution.target.hasOwnProperty('conversationId')) {
        newData.conversationId = execution.target.conversationId;
    }

    if (execution.target.hasOwnProperty('cachedCustomerId')) {
        newData.customerId = execution.target.cachedCustomerId;
    }

    const { config = {} } = action;

    if (config.hasOwnProperty('cardName')) {
        newData.name = config.cardName
    }

    if (config.hasOwnProperty('stageId')) {
        newData.stageId = config.stageId
    }

    sendRPCMessage(`add-${type}`, { type, ...newData });

    return newData;
}