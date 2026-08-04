import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  buildDealAssigneeActivities,
  buildDealAssignmentActivities,
  buildDealDescriptionChangedActivity,
  buildDealFieldChangedActivity,
  buildDealStageMovedActivity,
} from './builders';
import { ITag } from 'erxes-api-shared/core-types';

type DealActivityContext = {
  deal: any;
  models: IModels;
  subdomain: string;
};

export const dealActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, ctx: DealActivityContext) => {
    if (!field) {
      return [];
    }

    return [
      buildDealFieldChangedActivity({
        deal: ctx.deal,
        field,
        prev,
        current,
      }),
    ];
  },

  description: ({ prev, current }, ctx: DealActivityContext) => [
    buildDealDescriptionChangedActivity({
      deal: ctx.deal,
      prev,
      current,
    }),
  ],

  stageId: async ({ prev, current }, ctx: DealActivityContext) => {
    const [currentStage, prevStage] = await Promise.all([
      ctx.models.Stages.findOne({ _id: current }, { name: 1 }),
      ctx.models.Stages.findOne({ _id: prev }, { name: 1 }),
    ]);

    return [
      buildDealStageMovedActivity({
        deal: ctx.deal,
        prev,
        current,
        fromStage: prevStage?.name,
        toStage: currentStage?.name,
      }),
    ];
  },

  assignedUserIds: async (
    { added = [], removed = [] },
    ctx: DealActivityContext,
  ) => buildDealAssigneeActivities({ deal: ctx.deal, added, removed }),

  labelIds: async ({ added = [], removed = [] }, ctx: DealActivityContext) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.PipelineLabels.find(
            { _id: { $in: added } },
            { name: 1 },
          ).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.PipelineLabels.find(
            { _id: { $in: removed } },
            { name: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildDealAssignmentActivities({
      deal: ctx.deal,
      activityTypeAdded: 'deal.label_assigned',
      activityTypeRemoved: 'deal.label_unassigned',
      actionAdded: 'deal.label_assigned',
      actionRemoved: 'deal.label_unassigned',
      added,
      removed,
      addedLabels: addedLabels.map((label: any) => label.name),
      removedLabels: removedLabels.map((label: any) => label.name),
      entityLabel: 'label',
    });
  },

  tagIds: async ({ added = [], removed = [] }, ctx: DealActivityContext) => {
    const [addedTags, removedTags] = await Promise.all([
      added.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'tags',
            action: 'find',
            input: { query: { _id: { $in: added } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
      removed.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'tags',
            action: 'find',
            input: { query: { _id: { $in: removed } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
    ]);

    return buildDealAssignmentActivities({
      deal: ctx.deal,
      activityTypeAdded: 'deal.tag_added',
      activityTypeRemoved: 'deal.tag_removed',
      actionAdded: 'deal.tag_added',
      actionRemoved: 'deal.tag_removed',
      added,
      removed,
      addedLabels: addedTags.map((tag: ITag) => tag.name),
      removedLabels: removedTags.map((tag: ITag) => tag.name),
      entityLabel: 'tag',
    });
  },

  branchIds: async ({ added = [], removed = [] }, ctx: DealActivityContext) => {
    const [addedBranches, removedBranches] = await Promise.all([
      added.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'branches',
            action: 'find',
            input: { query: { _id: { $in: added } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
      removed.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'branches',
            action: 'find',
            input: { query: { _id: { $in: removed } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
    ]);

    return buildDealAssignmentActivities({
      deal: ctx.deal,
      activityTypeAdded: 'deal.branch_assigned',
      activityTypeRemoved: 'deal.branch_unassigned',
      actionAdded: 'deal.branch_assigned',
      actionRemoved: 'deal.branch_unassigned',
      added,
      removed,
      addedLabels: addedBranches.map((branch: any) => branch.title),
      removedLabels: removedBranches.map((branch: any) => branch.title),
      entityLabel: 'branch',
    });
  },

  departmentIds: async (
    { added = [], removed = [] },
    ctx: DealActivityContext,
  ) => {
    const [addedDepartments, removedDepartments] = await Promise.all([
      added.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'departments',
            action: 'find',
            input: { query: { _id: { $in: added } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
      removed.length
        ? sendTRPCMessage({
            subdomain: ctx.subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'departments',
            action: 'find',
            input: { query: { _id: { $in: removed } } },
            defaultValue: [],
          })
        : Promise.resolve([]),
    ]);

    return buildDealAssignmentActivities({
      deal: ctx.deal,
      activityTypeAdded: 'deal.department_assigned',
      activityTypeRemoved: 'deal.department_unassigned',
      actionAdded: 'deal.department_assigned',
      actionRemoved: 'deal.department_unassigned',
      added,
      removed,
      addedLabels: addedDepartments.map((department: any) => department.title),
      removedLabels: removedDepartments.map(
        (department: any) => department.title,
      ),
      entityLabel: 'department',
    });
  },
};
