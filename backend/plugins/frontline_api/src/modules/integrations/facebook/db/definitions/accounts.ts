import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const accountSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    kind: { type: String },
    token: {
      type: String,
    },
    tokenSecret: {
      type: String,
      optional: true,
    },
    scope: {
      type: String,
      optional: true,
    },
    expireDate: {
      type: String,
      optional: true,
    },
    name: { type: String },
    uid: { type: String },
    // Meta app that minted `token`. Absent on accounts created before page
    // posting could run on its own app; those belong to the main app.
    appId: {
      type: String,
      optional: true,
    },
  }),
);
