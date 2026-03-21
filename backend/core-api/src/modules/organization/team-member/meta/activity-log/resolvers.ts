import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  buildUserActivatedActivity,
  buildUserAssignmentActivities,
  buildUserDeactivatedActivity,
  buildUserFieldChangedActivity,
  buildUserRoleChangedActivity,
} from './builders';

type UserActivityContext = {
  user: IUserDocument;
  models: IModels;
};

export const userActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, ctx: UserActivityContext) => {
    if (field == null) {
      return [];
    }

    return [
      buildUserFieldChangedActivity({
        user: ctx.user,
        field,
        prev,
        current,
      }),
    ];
  },

  isActive: ({ current }, ctx: UserActivityContext) =>
    current
      ? [buildUserActivatedActivity(ctx.user)]
      : [buildUserDeactivatedActivity(ctx.user)],

  role: ({ prev, current }, ctx: UserActivityContext) => [
    buildUserRoleChangedActivity({
      user: ctx.user,
      prevRole: prev,
      currentRole: current,
    }),
  ],

  branchIds: async ({ added = [], removed = [] }, ctx: UserActivityContext) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Branches.find({ _id: { $in: added } }, { title: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Branches.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'branchIds',
      added,
      removed,
      addedLabels: addedLabels.map((branch: any) => branch.title),
      removedLabels: removedLabels.map((branch: any) => branch.title),
    });
  },

  departmentIds: async (
    { added = [], removed = [] },
    ctx: UserActivityContext,
  ) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Departments.find(
            { _id: { $in: added } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Departments.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'departmentIds',
      added,
      removed,
      addedLabels: addedLabels.map((department: any) => department.title),
      removedLabels: removedLabels.map((department: any) => department.title),
    });
  },

  positionIds: async (
    { added = [], removed = [] },
    ctx: UserActivityContext,
  ) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Positions.find(
            { _id: { $in: added } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Positions.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'positionIds',
      added,
      removed,
      addedLabels: addedLabels.map((position: any) => position.title),
      removedLabels: removedLabels.map((position: any) => position.title),
    });
  },
};
