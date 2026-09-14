import { Schema } from 'mongoose';

export const githubMilestoneMappingSchema = new Schema(
  {
    subdomain: { type: String, label: 'Subdomain', required: true },
    installationId: {
      type: Number,
      label: 'Installation ID',
      required: true,
    },
    repoName: { type: String, label: 'Repository Name', required: true },
    erxesMilestoneId: {
      type: Schema.Types.ObjectId,
      label: 'erxes Milestone ID',
      required: true,
    },
    githubMilestoneId: {
      type: Number,
      label: 'GitHub Milestone ID',
      required: true,
    },
    githubMilestoneNumber: {
      type: Number,
      label: 'GitHub Milestone Number',
      required: true,
    },
    githubMilestoneTitle: {
      type: String,
      label: 'GitHub Milestone Title',
      required: true,
    },
  },
  { timestamps: true },
);

githubMilestoneMappingSchema.index(
  { subdomain: 1, installationId: 1, repoName: 1, erxesMilestoneId: 1 },
  { unique: true },
);
githubMilestoneMappingSchema.index(
  { subdomain: 1, installationId: 1, repoName: 1, githubMilestoneId: 1 },
  { unique: true },
);
