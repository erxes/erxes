import { Schema } from 'mongoose';

export const githubConnectionSchema = new Schema(
  {
    installationId: { type: Number, label: 'Installation ID', required: true },
    orgName: {
      type: String,
      label: 'Organization Name',
    },
    orgAvatarUrl: {
      type: String,
      label: 'Organization Avatar URL',
    },
    orgType: { type: String, label: 'Organization Type', required: true },
    initiatedUserId: {
      type: Schema.Types.ObjectId,
      label: 'Initiated User ID',
    },
    isActive: { type: Boolean, label: 'Is Active', required: true },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

githubConnectionSchema.index(
  { installationId: 1, subdomain: 1 },
  { unique: true },
);
githubConnectionSchema.index({ isActive: 1, subdomain: 1 });
