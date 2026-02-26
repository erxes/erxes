import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const persistentMenuSchema = new Schema({
  _id: { type: Number },
  text: { type: String },
  type: { type: String },
  link: { type: String, optional: true },
});

export const instagramBotSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String },
    accountId: { type: String },
    uid: { type: String },
    pageId: { type: String },
    token: { type: String },
    persistentMenus: { type: [persistentMenuSchema] },
    greetText: { type: String, optional: true },
    tag: { type: String, optional: true },
    createdAt: { type: Date, default: Date.now() },
    isEnabledBackBtn: { type: Boolean, optional: true },
    backButtonText: { type: String, optional: true },
  }),
);
