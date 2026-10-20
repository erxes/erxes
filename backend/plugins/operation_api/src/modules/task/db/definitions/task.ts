import { contactFieldsSchemaPlugin } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';

export const taskSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    status: { type: Schema.Types.ObjectId, label: 'Status ID', required: true },
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    priority: { type: Number, label: 'Priority', default: 0 },
    labelIds: { type: [String], label: 'Label IDs' },
    tagIds: { type: [String], label: 'Tag IDs' },
    // The task's contacts, kept on the task instead of core relations.
    // Missing (not `[]`) until the task is migrated; see
    // contactFieldsSchemaPlugin.
    customerIds: { type: [String], label: 'Customer IDs', default: undefined },
    companyIds: { type: [String], label: 'Company IDs', default: undefined },
    assigneeId: { type: String, label: 'Assignee' },
    createdBy: { type: String, label: 'Created By' },
    startDate: { type: Date, label: 'Start Date' },
    targetDate: { type: Date, label: 'Due Date' },
    cycleId: { type: Schema.Types.ObjectId, label: 'Cycle ID' },
    projectId: { type: Schema.Types.ObjectId, label: 'Project ID' },
    milestoneId: { type: Schema.Types.ObjectId, label: 'Milestone ID' },
    estimatePoint: { type: Number, label: 'Estimate Point', default: 0 },
    statusChangedDate: {
      type: Date,
      label: 'Complated Date',
      default: Date.now,
    },
    number: { type: Number, label: 'Number', default: 0 },
    statusType: { type: Number, label: 'Status Type', default: 0 },
    githubIssueNumber: { type: Number, label: 'GitHub Issue Number' },
    githubIssueUrl: { type: String, label: 'GitHub Issue URL' },
    githubRepoName: { type: String, label: 'GitHub Repo Name' },
    propertiesData: {
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Properties data',
    },

    segmentIds: {
      type: [String],
      optional: true,
      default: undefined,
      index: true,
      sparse: true,
      label: 'Segment IDs',
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ assigneeId: 1 }, { sparse: true });
taskSchema.index({ createdBy: 1 }, { sparse: true });
taskSchema.index({ customerIds: 1 });
taskSchema.index({ companyIds: 1 });

taskSchema.plugin(contactFieldsSchemaPlugin);
