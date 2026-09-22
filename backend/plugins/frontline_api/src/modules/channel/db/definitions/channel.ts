import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const channelSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    createdAt: { type: Date, label: 'Created at' },
    createdBy: { type: String, label: 'Created by' },
    name: { type: String, label: 'Name' },
    icon: { type: String, label: 'Icon' },
    memberIds: { type: [String], label: 'Members' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
    userId: { type: String, label: 'Created by' },
    scope: {
      type: String,
      enum: ['team', 'personal'],
      default: 'team',
      label: 'Scope',
    },
    conversationCount: {
      type: Number,
      default: 0,
      label: 'Conversation count',
    },
    openConversationCount: {
      type: Number,
      default: 0,
      label: 'Open conversation count',
    },
  }),
);

// A user owns at most one personal channel. The partial filter keeps team
// channels — and legacy channels saved before `scope` existed — out of the index.
channelSchema.index(
  { createdBy: 1 },
  { unique: true, partialFilterExpression: { scope: 'personal' } },
);

const channelMemberRole = {
  ADMIN: 'admin',
  MEMBER: 'member',
  LEAD: 'lead',
  ALL: ['admin', 'member', 'lead'],
};

export const channelMembers = schemaWrapper(
  new Schema({
    memberId: { type: String, label: 'Member ID' },
    channelId: { type: String, label: 'Channel ID' },
    role: { type: String, label: 'Role', enum: channelMemberRole.ALL },
    createdAt: { type: Date, label: 'Created at' },
    createdBy: { type: String, label: 'Created by' },
  }),
);

channelMembers.index({ channelId: 1, memberId: 1 }, { unique: true });
