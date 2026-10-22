import { contactFieldsSchemaPlugin } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';

export const projectSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description', default: null },
    status: { type: Number, label: 'Status', default: 0 },
    priority: { type: Number, label: 'Priority', default: 0 },
    icon: { type: String, label: 'Icon', default: 'IconBox' },
    teamIds: {
      type: [Schema.Types.ObjectId],
      label: 'Team ID',
      required: true,
    },
    tagIds: { type: [String], label: 'Tag IDs' },
    // The project's contacts, kept on the project as well as core relations.
    // Missing (not `[]`) until the project is migrated; see
    // contactFieldsSchemaPlugin.
    customerId: { type: String, label: 'Customer', default: undefined },
    companyId: { type: String, label: 'Company', default: undefined },
    startDate: { type: Date, label: 'Start Date', default: null },
    targetDate: { type: Date, label: 'Target Date', default: null },
    leadId: { type: String, label: 'Lead ID', default: null },
    memberIds: { type: [String], label: 'Member IDs' },
    createdBy: { type: String, label: 'Created By', default: null },
    convertedFromId: { type: Schema.Types.ObjectId, label: 'Converted From' },
    propertiesData: {
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Properties data',
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ customerId: 1 });
projectSchema.index({ companyId: 1 });

projectSchema.plugin(contactFieldsSchemaPlugin);
