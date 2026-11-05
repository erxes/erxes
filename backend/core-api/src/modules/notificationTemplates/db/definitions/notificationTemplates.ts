import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface INotificationTemplateVersion {
  subject?: string;
  preheader?: string;
  // html with its fields left as placeholders, filled per recipient
  content?: string;
  // the editor's source, body only: header and footer are added on save
  contentJson?: Record<string, unknown>;
  savedBy?: string;
  savedAt?: Date;
}

export interface INotificationTemplate {
  key: string;
  draft?: INotificationTemplateVersion;
  published?: INotificationTemplateVersion;
  draftRevision: number;
  publishedRevision?: number;
  version: number;
  fallbackCount: number;
  lastFallbackAt?: Date;
  lastFallbackReason?: string;
}

export interface INotificationTemplateDocument
  extends INotificationTemplate,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const versionSchema = new Schema(
  {
    subject: { type: String, label: 'Subject' },
    preheader: { type: String, label: 'Preview text' },
    content: { type: String, label: 'Content' },
    contentJson: { type: Schema.Types.Mixed, label: 'Editor content' },
    savedBy: { type: String, label: 'Saved by' },
    savedAt: { type: Date, label: 'Saved at' },
  },
  { _id: false },
);

export const notificationTemplateSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      key: { type: String, required: true, unique: true, label: 'Template' },
      draft: { type: versionSchema, label: 'Draft' },
      published: { type: versionSchema, label: 'Published' },
      // bumped by every save; a save made from an older read is refused
      draftRevision: { type: Number, default: 0, label: 'Draft revision' },
      // the draft revision that is live, so unpublished changes show
      publishedRevision: { type: Number, label: 'Published revision' },
      version: { type: Number, default: 0, label: 'Published version' },
      fallbackCount: { type: Number, default: 0, label: 'Fallbacks' },
      lastFallbackAt: { type: Date, label: 'Last fallback at' },
      lastFallbackReason: { type: String, label: 'Last fallback reason' },
    },
    { timestamps: true },
  ),
);
