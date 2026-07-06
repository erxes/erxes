import { Schema } from "mongoose";

export const githubConnectionSchema = new Schema({
  installationId: { type: Number, label: 'Installation ID', required: true },
  orgName: {
    type: String,
    label: 'Organization Name',
  },
  orgAvatarUrl: {
    type: String,
    label: 'Organization Avatar URL'
  },
  orgType: { type: String, label: 'Organization Type' },
  initiatedUserId: {
    type: Schema.Types.ObjectId,
    label: 'Initiated User ID',
    required: false,
  },
  isActive: { type: Boolean, label: 'Is Active' },
  subdomain: { type: String, label: 'Subdomain' },
}, { timestamps: true });