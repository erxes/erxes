import {
  ActivityLogInput,
  buildBranchAssignmentActivity,
  buildDepartmentAssignmentActivity,
  buildPermissionGroupAssignmentActivity,
  buildPositionAssignmentActivity,
  Resolver,
} from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  buildUserActivatedActivity,
  buildUserDeactivatedActivity,
  buildUserFieldChangedActivity,
  buildUserRoleChangedActivity,
} from './builders';
import { buildTarget, getPermissionGroupLabels } from './utils';

type UserActivityContext = {
  target: IUserDocument;
  models: IModels;
};

export const userActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, { target }: UserActivityContext) => {
    if (field == null) {
      return [];
    }

    return [
      buildUserFieldChangedActivity({
        user: target,
        field,
        prev,
        current,
      }),
    ];
  },

  isActive: ({ current }, { target }: UserActivityContext) =>
    current
      ? [buildUserActivatedActivity(target)]
      : [buildUserDeactivatedActivity(target)],

  role: ({ prev, current }, { target }: UserActivityContext) => [
    buildUserRoleChangedActivity({
      user: target,
      prevRole: prev,
      currentRole: current,
    }),
  ],

  branchIds: async (
    { added = [], removed = [] },
    { target, models }: UserActivityContext,
  ) => {
    const activities: ActivityLogInput[] = [];

    if (added.length) {
      const branches = await models.Branches.find(
        { _id: { $in: added } },
        { title: 1 },
      ).lean();

      activities.push(
        buildBranchAssignmentActivity({
          activityType: 'branch.assigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'branches',
            text: branches.map(({ title }: any) => title).join(', '),
          },
          ids: added,
          labels: branches.map(({ title }: any) => title),
        }),
      );
    }

    if (removed.length) {
      const branches = await models.Branches.find(
        { _id: { $in: removed } },
        { title: 1 },
      ).lean();

      activities.push(
        buildBranchAssignmentActivity({
          activityType: 'branch.unassigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'branches',
            text: branches.map(({ title }: any) => title).join(', '),
          },
          ids: removed,
          labels: branches.map(({ title }: any) => title),
        }),
      );
    }

    return activities;
  },

  departmentIds: async (
    { added = [], removed = [] },
    { target, models }: UserActivityContext,
  ) => {
    const activities: ActivityLogInput[] = [];

    if (added.length) {
      const departments = await models.Departments.find(
        { _id: { $in: added } },
        { title: 1 },
      ).lean();

      activities.push(
        buildDepartmentAssignmentActivity({
          activityType: 'department.assigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'departments',
            text: departments.map(({ title }: any) => title).join(', '),
          },
          ids: added,
          labels: departments.map(({ title }: any) => title),
        }),
      );
    }

    if (removed.length) {
      const departments = await models.Departments.find(
        { _id: { $in: removed } },
        { title: 1 },
      ).lean();

      activities.push(
        buildDepartmentAssignmentActivity({
          activityType: 'department.unassigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'departments',
            text: departments.map(({ title }: any) => title).join(', '),
          },
          ids: removed,
          labels: departments.map(({ title }: any) => title),
        }),
      );
    }

    return activities;
  },

  positionIds: async (
    { added = [], removed = [] },
    { target, models }: UserActivityContext,
  ) => {
    const activities: ActivityLogInput[] = [];

    if (added.length) {
      const positions = await models.Positions.find(
        { _id: { $in: added } },
        { title: 1 },
      ).lean();

      activities.push(
        buildPositionAssignmentActivity({
          activityType: 'position.assigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'positions',
            text: positions.map(({ title }: any) => title).join(', '),
          },
          ids: added,
          labels: positions.map(({ title }: any) => title),
        }),
      );
    }

    if (removed.length) {
      const positions = await models.Positions.find(
        { _id: { $in: removed } },
        { title: 1 },
      ).lean();

      activities.push(
        buildPositionAssignmentActivity({
          activityType: 'position.unassigned',
          target: buildTarget(target),
          context: {
            moduleName: 'organization',
            collectionName: 'positions',
            text: positions.map(({ title }: any) => title).join(', '),
          },
          ids: removed,
          labels: positions.map(({ title }: any) => title),
        }),
      );
    }

    return activities;
  },

  permissionGroupIds: async (
    { added = [], removed = [] },
    { target, models }: UserActivityContext,
  ) => {
    const activities: ActivityLogInput[] = [];

    if (added.length) {
      const labels = await getPermissionGroupLabels(models, added);

      activities.push(
        buildPermissionGroupAssignmentActivity({
          activityType: 'permission_group.assigned',
          target: buildTarget(target),
          context: {
            moduleName: 'permissions',
            collectionName: 'permission_groups',
            text: labels.join(', '),
          },
          ids: added,
          labels,
        }),
      );
    }

    if (removed.length) {
      const labels = await getPermissionGroupLabels(models, removed);

      activities.push(
        buildPermissionGroupAssignmentActivity({
          activityType: 'permission_group.unassigned',
          target: buildTarget(target),
          context: {
            moduleName: 'permissions',
            collectionName: 'permission_groups',
            text: labels.join(', '),
          },
          ids: removed,
          labels,
        }),
      );
    }

    return activities;
  },
};
