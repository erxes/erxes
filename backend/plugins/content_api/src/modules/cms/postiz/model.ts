import { Schema } from 'mongoose';
export interface CmsShare {
  _id: string;
  postId: string;
  clientPortalId: string;
  userId: string;
  language: string;
  requestId: string;
  channelId: string;
  channelName: string;
  caption: string;
  media: string[];
  fingerprint: string;
  state: string;
  remotePostId?: string;
  url?: string;
  message?: string;
  nextCheck: Date;
  leaseUntil: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
export const cmsShareSchema = new Schema<CmsShare>(
  {
    _id: { type: String, required: true },
    postId: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    userId: { type: String, required: true },
    language: { type: String, required: true },
    requestId: { type: String, required: true },
    channelId: { type: String, required: true },
    channelName: { type: String, required: true },
    caption: { type: String, required: true },
    media: [String],
    fingerprint: { type: String, required: true },
    state: {
      type: String,
      enum: [
        'PENDING',
        'QUEUED',
        'PUBLISHED',
        'FAILED',
        'UNKNOWN',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
    remotePostId: String,
    url: String,
    message: String,
    nextCheck: { type: Date, default: Date.now },
    leaseUntil: { type: Date, default: () => new Date(0) },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);
cmsShareSchema.index({ state: 1, nextCheck: 1, leaseUntil: 1 });
cmsShareSchema.index({ postId: 1, createdAt: -1 });
