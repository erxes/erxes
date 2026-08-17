import { ActivityLogInput } from 'erxes-api-shared/core-modules';
import { buildDealTarget, getDealFieldLabel } from './utils';

export const buildDealFieldChangedActivity = (params: {
  deal: any;
  field: string;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { deal, field, prev, current } = params;
  const fieldLabel = getDealFieldLabel(field);

  return {
    activityType: 'deal.field_changed',
    target: buildDealTarget(deal),
    action: {
      type: 'deal.field_changed',
      description: `changed ${fieldLabel.toLowerCase()}`,
    },
    changes: { prev: { [field]: prev }, current: { [field]: current } },
    metadata: { field, fieldLabel },
  };
};

export const buildDealDescriptionChangedActivity = (params: {
  deal: any;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { deal, prev, current } = params;

  return {
    activityType: 'description_change',
    target: buildDealTarget(deal),
    action: {
      type: 'updated',
      description: prev ? 'changed description' : 'set description',
    },
    changes: { prev, current },
    metadata: { field: 'description' },
  };
};

export const buildDealStageMovedActivity = (params: {
  deal: any;
  prev: unknown;
  current: unknown;
  fromStage: unknown;
  toStage: unknown;
}): ActivityLogInput => {
  const { deal, prev, current, fromStage, toStage } = params;

  return {
    activityType: 'deal.stage_moved',
    target: buildDealTarget(deal),
    action: {
      type: 'moved',
      description: `moved from "${fromStage || prev}" to "${toStage || current}"`,
    },
    changes: { prev: { stageId: prev }, current: { stageId: current } },
    metadata: {
      fromStage: fromStage || prev,
      toStage: toStage || current,
    },
  };
};

export const buildDealAssignmentActivities = (params: {
  deal: any;
  activityTypeAdded: string;
  activityTypeRemoved: string;
  actionAdded: string;
  actionRemoved: string;
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
  entityLabel: string;
}): ActivityLogInput[] => {
  const {
    deal,
    activityTypeAdded,
    activityTypeRemoved,
    actionAdded,
    actionRemoved,
    added,
    removed,
    addedLabels,
    removedLabels,
    entityLabel,
  } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: activityTypeAdded,
      target: buildDealTarget(deal),
      context: { text: addedLabels.join(', ') },
      action: { type: actionAdded, description: `assigned ${entityLabel}` },
      changes: { added: { ids: added, labels: addedLabels } },
      metadata: { entityLabel },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: activityTypeRemoved,
      target: buildDealTarget(deal),
      context: { text: removedLabels.join(', ') },
      action: { type: actionRemoved, description: `removed ${entityLabel}` },
      changes: { removed: { ids: removed, labels: removedLabels } },
      metadata: { entityLabel },
    });
  }

  return activities;
};

export const buildDealAssigneeActivities = (params: {
  deal: any;
  added: string[];
  removed: string[];
}): ActivityLogInput[] => {
  const { deal, added, removed } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: 'assignee',
      target: buildDealTarget(deal),
      action: { type: 'assigned', description: 'assigned team member' },
      context: { data: added.map((id) => ({ _id: id })), text: '' },
      metadata: { field: 'assignedUserIds' },
      changes: { added },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: 'assignee',
      target: buildDealTarget(deal),
      action: { type: 'unassigned', description: 'unassigned team member' },
      context: { data: removed.map((id) => ({ _id: id })), text: '' },
      metadata: { field: 'assignedUserIds' },
      changes: { removed },
    });
  }

  return activities;
};

export const generateDealCreatedActivityLog = (
  deal: any,
  userId?: string,
): ActivityLogInput => ({
  activityType: 'create',
  target: buildDealTarget(deal),
  action: {
    type: 'create',
    description: 'Deal created',
  },
  changes: {
    name: deal.name,
    stageId: deal.stageId,
    createdAt: new Date(),
  },
  metadata: {
    stageId: deal.stageId,
    userId: userId || deal.userId,
  },
});

export const generateDealMovedActivityLog = (
  deal: any,
  fromStageId: string,
  toStageId: string,
  fromStageName?: string,
  toStageName?: string,
): ActivityLogInput => ({
  activityType: 'move',
  target: buildDealTarget(deal),
  action: {
    type: 'move',
    description: 'Deal moved to different stage',
  },
  changes: {
    fromStage: fromStageName || fromStageId,
    toStage: toStageName || toStageId,
    movedAt: new Date(),
  },
  metadata: {
    fromStageId,
    toStageId,
    dealId: deal._id,
  },
});

export const generateDealConvertedActivityLog = (
  deal: any,
  conversationId: string,
): ActivityLogInput => ({
  activityType: 'convert',
  target: buildDealTarget(deal),
  action: {
    type: 'convert',
    description: 'Conversation converted to deal',
  },
  changes: {
    sourceConversationId: conversationId,
    convertedAt: new Date(),
  },
  metadata: {
    conversationId,
    dealId: deal._id,
  },
});

export const generateDealWatchActivityLog = (
  deal: any,
  isAdd: boolean,
  userId: string,
): ActivityLogInput => ({
  activityType: isAdd ? 'deal.watch_added' : 'deal.watch_removed',
  target: buildDealTarget(deal),
  action: {
    type: isAdd ? 'watch' : 'unwatch',
    description: isAdd ? 'started watching deal' : 'stopped watching deal',
  },
  changes: {
    watchedUserId: userId,
  },
  metadata: {
    userId,
  },
});
