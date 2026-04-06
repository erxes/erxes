import { ActivityLogInput } from '../../common/eventHandlers';

type AssignmentActivityType =
  | 'branch.assigned'
  | 'branch.unassigned'
  | 'department.assigned'
  | 'department.unassigned'
  | 'position.assigned'
  | 'position.unassigned'
  | 'permission_group.assigned'
  | 'permission_group.unassigned';

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

export const buildBranchAssignmentActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'branch',
    field: 'branchIds',
  });

export const buildDepartmentAssignmentActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'department',
    field: 'departmentIds',
  });

export const buildPositionAssignmentActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'position',
    field: 'positionIds',
  });

export const buildPermissionGroupAssignmentActivity = (
  params: Omit<BuildEntityAssignmentActivityParams, 'entityLabel' | 'field'>,
) =>
  buildEntityAssignmentActivity({
    ...params,
    entityLabel: 'permission group',
    field: 'permissionGroupIds',
  });
