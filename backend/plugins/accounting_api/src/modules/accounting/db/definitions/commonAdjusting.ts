import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const accountSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,

  }),
);
