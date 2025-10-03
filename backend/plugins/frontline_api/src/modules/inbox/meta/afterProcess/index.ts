import { IAfterProcessRule } from 'erxes-api-shared/utils';
import { conversationAfterProcessWorkers } from '~/modules/inbox/meta/afterProcess/conversation';

export const inboxAfterProcessWorkers = {
  rules: [...conversationAfterProcessWorkers.rules] as IAfterProcessRule[],
  updatedDocument: {
    conversation: conversationAfterProcessWorkers.onDocumentUpdated,
  },
  createdDocument: {},
};
