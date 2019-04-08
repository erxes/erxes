import { publishClientMessage, publishMessage } from '../../data/resolvers/mutations/conversations';
import { ActivityLogs, ConversationMessages, Conversations, Customers } from '../models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from '../models/definitions/constants';

const cocFindOne = (conversationId: string, cocId: string, cocType: string) => {
  return ActivityLogs.findOne({
    'activity.type': ACTIVITY_TYPES.CONVERSATION,
    'activity.action': ACTIVITY_ACTIONS.CREATE,
    'activity.id': conversationId,
    'contentType.type': cocType,
    'performedBy.type': ACTIVITY_PERFORMER_TYPES.CUSTOMER,
    'contentType.id': cocId,
  });
};

const cocCreate = (conversationId: string, content: string, cocId: string, cocType: string) => {
  return ActivityLogs.createDoc({
    activity: {
      type: ACTIVITY_TYPES.CONVERSATION,
      action: ACTIVITY_ACTIONS.CREATE,
      content,
      id: conversationId,
    },
    performer: {
      type: ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      id: cocId,
    },
    contentType: {
      type: cocType,
      id: cocId,
    },
  });
};

const conversationListeners = () => {
  ConversationMessages.watch().on('change', data => {
    const message = data.fullDocument;

    if (data.operationType === 'insert' && message) {
      publishClientMessage(message);
      publishMessage(message);
    }
  });

  Conversations.watch().on('change', async data => {
    const conversation = data.fullDocument;

    /**
     * Create a conversation log for a given customer,
     * if the customer is related to companies,
     * then create conversation log with all related companies
     */
    if (data.operationType === 'insert' && conversation) {
      const customer = await Customers.findOne({ _id: conversation.customerId });

      if (customer) {
        if (customer == null || (customer && !customer._id)) {
          throw new Error(`'customer' must be supplied when adding activity log for conversations`);
        }

        if (customer.companyIds && customer.companyIds.length > 0) {
          for (const companyId of customer.companyIds) {
            // check against duplication
            const log = await cocFindOne(conversation._id, companyId, ACTIVITY_CONTENT_TYPES.COMPANY);

            if (!log) {
              await cocCreate(conversation._id, conversation.content || '', companyId, ACTIVITY_CONTENT_TYPES.COMPANY);
            }
          }
        }

        // check against duplication ======
        const foundLog = await cocFindOne(conversation._id, customer._id, ACTIVITY_CONTENT_TYPES.CUSTOMER);

        if (!foundLog) {
          return cocCreate(conversation._id, conversation.content || '', customer._id, ACTIVITY_CONTENT_TYPES.CUSTOMER);
        }
      }
    }
  });
};

export default conversationListeners;
