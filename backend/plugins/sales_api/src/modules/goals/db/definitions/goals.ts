import { Document, Schema } from 'mongoose';
import { mongoStringRequired,schemaWrapper } from 'erxes-api-shared/utils';


export const goalSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    name: { type: String, label: 'Name' },
    entity: { type: String, label: 'Choose Entity' },
    contributionType: { type: String, label: 'Contribution Type' },
    specificPeriodGoals: {
      type: Object,
      optional: true,
      label: 'Specific Period Goals',
    },

    stageId: { type: String, label: 'Stage ID' },
    pipelineId: { type: String, label: 'Pipeline ID' },
    boardId: { type: String, label: 'Board ID' },

    metric: { type: String, label: 'Metric' },
    goalTypeChoose: { type: String, label: 'Choose Goal Type' },
    contribution: { type: [String], label: 'Contribution' },

    startDate: { type: Date, label: 'Start Date' },
    endDate: { type: Date, label: 'End Date' },

    department: { type: [String], label: 'Department' },
    unit: { type: [String], label: 'Unit' },
    branch: { type: [String], label: 'Branch' },

    stageRadio: { type: Boolean, label: 'Stage Check' },
    segmentRadio: { type: Boolean, label: 'Segment Check' },
    segmentIds: { type: [String], label: 'Segment Data' },

    periodGoal: { type: String, label: 'Period' },
    teamGoalType: { type: String, label: 'Team Structure' },
    segmentCount: { type: Number, min: 0, label: 'Segment Count' },

    pipelineLabels: { type: [Object], label: 'Pipeline Labels' },
    productIds: { type: [String], label: 'Product IDs' },
    companyIds: { type: [String], label: 'Company IDs' },
    tagsIds: { type: [String], label: 'Tag IDs' },

    createdAt: { type: Date, label: 'Created At' },
  }),
);

// Index for faster lookups
goalSchema.index({ name: 1, entity: 1, pipelineId: 1 });