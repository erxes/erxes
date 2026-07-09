import { Schema } from 'mongoose';

export const githubConfigSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    repoName: { type: String, label: 'Repo Name', required: true },
    installationId: {
      type: Number,
      label: 'Installation ID',
      required: true,
    },
    syncMode: {
      type: String,
      enum: ['oneWay', 'twoWay'],
      label: 'Sync Mode',
      required: true,
    },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);
