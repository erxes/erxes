import mongoose from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IWebActivityLogDocument } from '../../@types/webActivityLog';

export const webActivityLogSchema = new mongoose.Schema<IWebActivityLogDocument>(
  {
    _id: mongooseStringRandomId,
    webId: { type: String, required: true, index: true },
    userId: { type: String },
    action: { type: String, required: true },
    changes: [
      {
        field: { type: String },
        from: { type: mongoose.Schema.Types.Mixed },
        to: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true },
);