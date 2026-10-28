import { ActivityLogInput } from '../../common/eventHandlers';

type AssignmentActivityType =
  | 'structure_entity.assigned'
  | 'structure_entity.unassigned'
  | 'structure_seat.assigned'
  | 'structure_seat.unassigned';

type BuildEntityAssignmentActivityParams = {
  activityType: AssignmentActivityType;
  target: any;
  context?: any;
  ids: string[];
  labels: string[];
  entityLabel: string;
  field: string;
  metadata?: Record<string, any>;
};

const buildEntityAssignmentActivity = ({
  activityType,
  target,
  context,
  ids,
  labels,
  entityLabel,
  field,
  metadata,
}: BuildEntityAssignmentActivityParams): ActivityLogInput => {
  const [, action] = (activityType || '').split('.');
  const isAssigned = action === 'assigned';

  return {
    activityType,
    target,
    context,
    action: {
      type: activityType,
      description: isAssigned
        ? `assigned ${entityLabel}`
        : `removed ${entityLabel}`,
    },
    changes: {
      [isAssigned ? 'added' : 'removed']: {
        ids,
        labels,
      },
    },
    metadata: {
      field,
      entityLabel,
      ...metadata,
    },
  };
};

export const buildStructureMembershipActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'structure node',
    field: 'structureEntityIds',
  });

export const buildStructureSeatActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'seat',
    field: 'structureSeatIds',
  });
