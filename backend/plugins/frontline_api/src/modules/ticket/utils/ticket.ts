import { TICKET_DEFAULT_STATUSES } from '@/ticket/constants/types';
import { IModels, generateModels } from '~/connectionResolvers';
import { sendNotification } from 'erxes-api-shared/core-modules';
import { ITicket, ITicketDocument } from '@/ticket/@types/ticket';
import { subMinutes, isAfter } from 'date-fns';

export const generateDefaultStatuses = (pipelineId: string) => {
  return TICKET_DEFAULT_STATUSES.map((status, index) => ({
    ...status,
    pipelineId,
    order: status.order ?? index + 1,
  }));
};

export const checkChannel = async ({
  models,
  channelId,
}: {
  models: IModels;
  channelId?: string;
}) => {
  if (!channelId) {
    throw new Error('ChannelId is required');
  }

  const channel = await models.Channels.findOne({ _id: channelId });

  if (!channel) {
    throw new Error('Channel is not found');
  }
};

export const checkPipeline = async ({
  models,
  pipelineId,
}: {
  models: IModels;
  pipelineId?: string;
}) => {
  if (!pipelineId) {
    throw new Error('PipelineId is required');
  }
  const pipeline = await models.Pipeline.findOne({ _id: pipelineId });
  if (!pipeline) {
    throw new Error('Pipeline is not found');
  }
  return pipeline;
};

const getTitle = (contentType: string) => {
  if (contentType === 'ticket') {
    return 'ticket';
  }
};

const getMessage = (contentType: string, notificationType: string) => {
  switch (notificationType) {
    case 'ticketAssignee':
      return 'You have been assigned to ticket';
    case 'ticketStatus':
      return 'You have been assigned to ticket';
    case 'note':
      return `You have been mentioned in ${contentType}'s note`;
    default:
      return 'Notification';
  }
};

export const createNotifications = async ({
  contentType,
  contentTypeId,
  fromUserId,
  subdomain,
  notificationType,
  userIds,
  action,
}: {
  contentType: string;
  contentTypeId: string;
  fromUserId: string;
  subdomain: string;
  notificationType: string;
  userIds: string[];
  action: string;
}) => {
  sendNotification(subdomain, {
    title: getTitle(contentType),
    message: getMessage(contentType, notificationType),
    type: 'info',
    userIds,
    priority: 'low',
    kind: 'user',
    fromUserId,
    contentType: `ticket:${contentType}`,
    contentTypeId,
    notificationType,
    action,
    metadata: {
      contentTypeId,
    },
  });
};

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
  PIPELINE = 'PIPELINE',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  DESCRIPTION = 'DESCRIPTION',
}

const FIELD_TO_MODULE: Record<string, Module> = {
  assigneeId: Module.ASSIGNEE,
  pipelineId: Module.PIPELINE,
  pipelineIds: Module.PIPELINE,
  startDate: Module.START_DATE,
  targetDate: Module.END_DATE,
  statusId: Module.STATUS,
  description: Module.DESCRIPTION,
};

const toStr = (val: any): string | undefined =>
  val != null ? String(val) : undefined;

const getModule = (field: string): Module | null =>
  Module[field.toUpperCase() as keyof typeof Module] ??
  FIELD_TO_MODULE[field] ??
  null;

export const createActivity = async (args: {
  contentType: 'ticket';
  oldDoc: ITicketDocument;
  newDoc: Partial<ITicket>;
  subdomain: string;
  userId: string;
  contentId: string;
}) => {
  const { oldDoc, newDoc, subdomain, userId, contentId } = args;

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

    let action: Action | null = null;

    if (['startDate', 'targetDate'].includes(field)) {
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
