import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addBoardItem = async ({ action, execution, type }) => {

    const newData = await replacePlaceHolders({ actionData: action.config, triggerData: { ...execution.triggerData, ...execution.actionsData } });

    if (execution.triggerData.hasOwnProperty('conversationId')) {
        newData.conversationId = execution.triggerData.conversationId;
    }

    if (execution.triggerData.hasOwnProperty('cachedCustomerId')) {
        newData.customerId = execution.triggerData.cachedCustomerId;
    }

    const { config = {} } = action;

    if (config.hasOwnProperty('cardName')) {
        newData.name = config.cardName
    }

    if (config.hasOwnProperty('stageId')) {
        newData.stageId = config.stageId
    }

    return sendRPCMessage(type, `add-${type}`, { ...newData });
}