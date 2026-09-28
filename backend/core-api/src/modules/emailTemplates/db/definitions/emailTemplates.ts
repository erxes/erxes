import {
  EMAIL_CONTENT_FORMATS,
  TEmailContentFormat,
} from 'erxes-api-shared/core-modules';
import { IEmailTemplateDocument } from 'erxes-api-shared/core-types';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const emailTemplateSchema = schemaWrapper(
  new Schema<IEmailTemplateDocument>({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Template name', required: true },
    description: { type: String, label: 'Template description' },
    content: { type: String, label: 'Block content' },
    contentJson: { type: Schema.Types.Mixed, label: 'Editor content' },
    // Absent on every template written before the email editor, and that
    // absence means block content — so nothing has to be migrated.
    contentFormat: {
      type: String,
      enum: Object.values(EMAIL_CONTENT_FORMATS) as TEmailContentFormat[],
      label: 'Content format',
    },
    createdBy: { type: String, label: 'Created by user ID', required: true },
    createdAt: { type: Date, label: 'Created at', default: Date.now },
    updatedAt: { type: Date, label: 'Updated at', default: Date.now },
  }),
);
