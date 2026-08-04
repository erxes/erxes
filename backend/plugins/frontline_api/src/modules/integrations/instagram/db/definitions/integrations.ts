import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const integrationSchema = new Schema({
  _id: mongooseStringRandomId,
  kind: String,
  accountId: String,
  erxesApiId: String,
  emailScope: String,
  instagramPageId: String,
  facebookPageId: String,
  email: String,
  expiration: String,

  facebookPageTokensMap: {
    type: Object,
    default: {},
  },
  healthStatus: String,
  error: String,
});
