import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const userSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    firstName: { type: String, label: 'First name', optional: true },
    lastName: { type: String, label: 'Last name', optional: true },
    middleName: { type: String, label: 'Middle name', optional: true },
    avatar: { type: String, optional: true, label: 'Avatar' },
    primaryEmail: {
      type: String,
      label: 'Primary Email',
      optional: true,
      esType: 'email',
    },
    emails: { type: [String], optional: true, label: 'Emails' },
    createdAt: { type: Date, label: 'Created at', esType: 'date' },
    modifiedAt: { type: Date, label: 'Modified at', esType: 'date' },
  }),
  { contentType: 'core:user' },
);

export default userSchema;
