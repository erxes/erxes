import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
export const integrationSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    kind: String,
    accountId: String,
    erxesApiId: String,
    emailScope: String,
    facebookPageIds: {
      type: [String],
      label: 'Facebook page ids',
      optional: true,
    },
    email: String,
    expiration: String,
    facebookPageTokensMap: {
      type: Object,
      default: {},
    },
    healthStatus: String,
    error: String,
    historyImport: {
      type: {
        status: String,
        startedAt: Date,
        finishedAt: Date,
        conversations: Number,
        messages: Number,
        skippedConversations: Number,
        error: String,
      },
      _id: false,
      optional: true,
    },
  }),
);
