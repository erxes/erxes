import { sendNotification } from 'erxes-api-shared/core-modules';
import { IAfterProcessRule } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  IConversation,
  IConversationDocument,
} from '@/inbox/@types/conversations';
import { conversationNotifReceivers } from '@/inbox/graphql/resolvers/mutations/conversations';

export const conversationAfterProcessWorkers = {
  rules: [
    {
      type: 'updatedDocument',
      contentTypes: ['frontline:inbox.conversation'],
    },
  ] as IAfterProcessRule[],
  onDocumentUpdated: async (
    subdomain: string,
    models: IModels,
    data: {
      collectionName: string;
      fullDocument: IConversationDocument;
      prevDocument: any;
      updateDescription: {
        updatedFields: { [key: string]: any };
        removedFields: string[];
      };
    },
  ) => {
    const { collectionName, fullDocument, updateDescription, prevDocument } =
      data || {};
    const { updatedFields } = updateDescription || {};

    if (collectionName === 'conversations') {
      const { _id, status, closedUserId = '' } = fullDocument || {};

      if (updatedFields.status === 'closed') {
        sendNotification(subdomain, {
          title: 'Conversation Resolved',
          message: `The conversation has been marked as ${status || ''}.`,
          type: 'info',
          fromUserId: closedUserId,
          userIds: conversationNotifReceivers(fullDocument, closedUserId || ''),
          contentType: 'frontline:inbox.conversation',
          notificationType: 'conversationStateChange',
          contentTypeId: _id,
          action: 'resolved',
          priority: 'medium',
          allowMultiple: true,
        });
      }

      if (updatedFields.status === 'open' && prevDocument.status === 'closed') {
        sendNotification(subdomain, {
          title: 'Conversation Reopened',
          message: `The conversation has been reopened and is now ${
            status || ''
          }.`,
          type: 'info',
          fromUserId: closedUserId,
          userIds: conversationNotifReceivers(
            fullDocument,
            fullDocument?.closedUserId || '',
          ),
          contentType: 'frontline:inbox.conversation',
          contentTypeId: _id,
          notificationType: 'conversationStateChange',
          action: 'resolved',
          priority: 'medium',
          allowMultiple: true,
        });
      }
    }
  },
};
