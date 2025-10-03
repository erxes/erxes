import { generateModels } from '~/connectionResolvers';
import { IProject, IProjectDocument } from '@/project/@types/project';
import { ITask, ITaskDocument } from '@/task/@types/task';
import { subMinutes, isAfter } from 'date-fns';
import { difference } from 'lodash';

enum Action {
  CREATED = 'CREATED',
  CHANGED = 'CHANGED',
  REMOVED = 'REMOVED',
}

enum Module {
  NAME = 'NAME',
  STATUS = 'STATUS',
  ASSIGNEE = 'ASSIGNEE',
  PRIORITY = 'PRIORITY',
  TEAM = 'TEAM',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  ESTIMATE_POINT = 'ESTIMATE_POINT',
  PROJECT = 'PROJECT',
  LEAD = 'LEAD',
  CYCLE = 'CYCLE',
}

const FIELD_TO_MODULE: Record<string, Module> = {
  assigneeId: Module.ASSIGNEE,
  teamId: Module.TEAM,
  teamIds: Module.TEAM,
  startDate: Module.START_DATE,
  targetDate: Module.END_DATE,
  estimatePoint: Module.ESTIMATE_POINT,
  leadId: Module.LEAD,
  cycleId: Module.CYCLE,
};

const toStr = (val: any): string | undefined =>
  val != null ? String(val) : undefined;

const getModule = (field: string): Module | null =>
  Module[field.toUpperCase() as keyof typeof Module] ??
  FIELD_TO_MODULE[field] ??
  null;

export const createActivity = async (
  args:
    | {
        contentType: 'task';
        oldDoc: ITaskDocument;
        newDoc: Partial<ITask>;
        subdomain: string;
        userId: string;
        contentId: string;
      }
    | {
        contentType: 'project';
        oldDoc: IProjectDocument;
        newDoc: Partial<IProject>;
        subdomain: string;
        userId: string;
        contentId: string;
      },
) => {
  const { contentType, oldDoc, newDoc, subdomain, userId, contentId } = args;

  const models = await generateModels(subdomain);

  const logActivity = async (
    action: Action,
    newValue: any,
    previousValue: any,
    module: Module,
  ) => {
    const lastActivity = await models.Activity.findOne({ contentId }).sort({
      createdAt: -1,
    });

    if (lastActivity?.module === module && lastActivity?.action === action) {
      const thirtyMinutesAgo = subMinutes(new Date(), 30);
      const isRecent = isAfter(
        new Date(lastActivity.createdAt),
        thirtyMinutesAgo,
      );

      if (
        isRecent &&
        toStr(newValue) === toStr(lastActivity.metadata.previousValue)
      ) {
        return models.Activity.removeActivity(lastActivity._id);
      }

      return models.Activity.updateActivity({
        _id: lastActivity._id,
        contentId,
        action,
        module,
        metadata: {
          newValue: toStr(newValue),
          previousValue: toStr(lastActivity.metadata.previousValue),
        },
        createdBy: userId,
      });
    }

    return models.Activity.createActivity({
      contentId,
      action,
      module,
      metadata: {
        newValue: toStr(newValue),
        previousValue: toStr(previousValue),
      },
      createdBy: userId,
    });
  };

  for (const [field, newValue] of Object.entries(newDoc)) {
    const oldValue = oldDoc[field as keyof typeof oldDoc];
    const module = getModule(field);

    if (!module) continue;

    if (contentType === 'project' && field === 'teamIds') {
      const oldTeamIds = (oldValue as string[]) || [];
      const newTeamIds = (newValue as string[]) || [];

      const added = difference(newTeamIds, oldTeamIds);
      const removed = difference(oldTeamIds, newTeamIds);

      for (const id of added) {
        await logActivity(Action.CREATED, id, null, Module.TEAM);
      }

      for (const id of removed) {
        await logActivity(Action.REMOVED, null, id, Module.TEAM);
      }

      continue;
    }

    let action: Action | null = null;

    if (['startDate', 'targetDate', 'estimatePoint'].includes(field)) {
      if (!oldValue && newValue) action = Action.CREATED;
      else if (newValue !== oldValue)
        action = newValue ? Action.CHANGED : Action.REMOVED;
    } else if (newValue !== oldValue) {
      action = Action.CHANGED;
    }

    if (action) {
      await logActivity(action, newValue, oldValue, module);
    }
  }
};
