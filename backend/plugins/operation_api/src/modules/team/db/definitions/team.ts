import { Schema } from 'mongoose';

export const teamSchema = new Schema(
  {
    icon: { type: String, label: 'Icon' },
    memberIds: { type: [String], label: 'Member IDs' },
    name: { type: String, label: 'Name' },
    description: { type: String, label: 'Description' },
    estimateType: { type: Number, label: 'Estimate Type' },
    cycleEnabled: { type: Boolean, label: 'Cycle Enabled', default: false },
  },
  {
    timestamps: true,
  },
);

export const teamMembers = new Schema({
  memberId: { type: String, label: 'Member ID' },
  teamId: { type: Schema.Types.ObjectId, label: 'Team ID' },
  role: { type: String, label: 'Role' },
});
