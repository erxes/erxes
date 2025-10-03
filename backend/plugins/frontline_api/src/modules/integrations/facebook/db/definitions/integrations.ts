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
  }),
  { contentType: 'frontline:facebook.integration' },
);
