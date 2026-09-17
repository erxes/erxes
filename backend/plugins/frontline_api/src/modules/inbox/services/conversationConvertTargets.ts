import { IUserDocument } from 'erxes-api-shared/core-types';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  ConversationConvertType,
  IConversationConvert,
} from '@/inbox/@types/conversationConvert';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';

const DEAL_PRIORITIES = ['No Priority', 'Minor', 'Medium', 'High', 'Critical'];

export interface IConvertContext {
  models: IModels;
  subdomain: string;
  user: IUserDocument;
  checkPermission: (action: string) => Promise<void>;
}

export interface IConvertInput {
  conversation: IConversationDocument;
  doc: IConversationConvert;
  name: string;
  stageId: string;
  assignedUserIds: string[];
}

export interface IConvertedTarget {
  _id: string;
  stageId?: string;
}

export interface IConvertTargetHandler {
  contentType: string;
  relateCustomer: boolean;
  requiredStageMessage: string;
  findExisting: (
    context: Pick<IConvertContext, 'models' | 'subdomain'>,
    conversationId: string,
    relatedIds: string[],
  ) => Promise<IConvertedTarget | null>;
  getUrl: (subdomain: string, target: IConvertedTarget) => Promise<string>;
  create: (context: IConvertContext, input: IConvertInput) => Promise<string>;
}

const toPriorityNumber = (priority?: string) => {
  const value = Number(priority);

  return Number.isInteger(value) && value >= 0 && value < DEAL_PRIORITIES.length
    ? value
    : 0;
};

const withoutNullish = <T extends Record<string, unknown>>(doc: T) =>
  Object.fromEntries(
    Object.entries(doc).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  ) as Partial<T>;

const validatePropertiesData = async (
  subdomain: string,
  propertiesData?: IConversationConvert['customFieldsData'],
) =>
  propertiesData
    ? sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'validateFieldValues',
        input: { data: propertiesData },
        defaultValue: {},
      })
    : undefined;

const ticketHandler: IConvertTargetHandler = {
  contentType: 'frontline:ticket',
  relateCustomer: true,
  requiredStageMessage: 'Status is required',

  findExisting: async ({ models }, conversationId, relatedIds) => {
    const ticket = await models.Ticket.findOne(
      {
        $or: [
          { _id: { $in: relatedIds } },
          { 'customerFieldData.sourceConversationIds': conversationId },
        ],
        state: { $ne: 'deleted' },
      },
      { _id: 1 },
    ).lean();

    return ticket ? { _id: ticket._id } : null;
  },

  getUrl: async (_subdomain, { _id }) => `/frontline/tickets?ticketId=${_id}`,

  create: async (
    { models, subdomain, user, checkPermission },
    { doc, name, stageId, assignedUserIds },
  ) => {
    await checkPermission('createTicket');

    const status = await models.Status.findOne({ _id: stageId }).lean();

    if (!status?.pipelineId) {
      throw new Error('Ticket status not found');
    }

    const pipeline = await models.Pipeline.findOne({
      _id: status.pipelineId,
    }).lean();

    if (!pipeline) {
      throw new Error('Ticket pipeline not found');
    }

    await createPermissionValidator(models).validatePipelineAccess(
      pipeline._id,
      user,
    );

    const propertiesData = await validatePropertiesData(
      subdomain,
      doc.customFieldsData,
    );

    const ticket = await models.Ticket.addTicket(
      {
        name,
        channelId: pipeline.channelId,
        pipelineId: pipeline._id,
        stageId: '',
        statusId: status._id,
        description: doc.description,
        priority: toPriorityNumber(doc.priority),
        assigneeId: assignedUserIds[0],
        branchId: doc.branchIds?.[0],
        departmentId: doc.departmentIds?.[0],
        labelIds: doc.labelIds,
        tagIds: doc.tagIds,
        startDate: doc.startDate,
        targetDate: doc.closeDate,
        attachments: doc.attachments,
        propertiesData,
      },
      user._id,
      subdomain,
    );

    await graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
      ticketChanged: { type: 'create', ticket },
    });

    await graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'create', ticket },
    });

    return ticket._id;
  },
};

const dealHandler: IConvertTargetHandler = {
  contentType: 'sales:deal',
  relateCustomer: false,
  requiredStageMessage: 'Stage is required',

  findExisting: ({ subdomain }, conversationId, relatedIds) =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'deal',
      action: 'findOne',
      input: {
        $or: [
          { _id: { $in: relatedIds } },
          { sourceConversationIds: conversationId },
        ],
      },
      defaultValue: null,
    }),

  getUrl: async (subdomain, { _id, stageId }) => {
    const pipeline: { _id: string; boardId: string } | null =
      await sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        method: 'query',
        module: 'pipeline',
        action: 'findOne',
        input: { stageId },
        defaultValue: null,
      });

    const params = new URLSearchParams({
      boardId: pipeline?.boardId || '',
      pipelineId: pipeline?._id || '',
      salesItemId: _id,
    });

    return `/sales/deals?${params.toString()}`;
  },

  create: async (
    { subdomain, user, checkPermission },
    { conversation, doc, name, stageId, assignedUserIds },
  ) => {
    await checkPermission('dealsAdd');

    const deal: { _id: string } | undefined = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'mutation',
      module: 'deal',
      action: 'createItem',
      input: {
        user,
        processId: `conversationConvert:${conversation._id}`,
        name,
        stageId,
        sourceConversationIds: [conversation._id],
        customerIds: conversation.customerId ? [conversation.customerId] : [],
        assignedUserIds,
        description: doc.description,
        priority: DEAL_PRIORITIES[toPriorityNumber(doc.priority)],
        labelIds: doc.labelIds,
        tagIds: doc.tagIds,
        branchIds: doc.branchIds,
        departmentIds: doc.departmentIds,
        startDate: doc.startDate,
        closeDate: doc.closeDate,
        attachments: doc.attachments,
        propertiesData: doc.customFieldsData,
      },
      context: { userId: user._id },
      throwOnError: true,
    });

    if (!deal?._id) {
      throw new Error('Sales plugin is not available');
    }

    return deal._id;
  },
};

const taskHandler: IConvertTargetHandler = {
  contentType: 'operation:task',
  relateCustomer: true,
  requiredStageMessage: 'Status is required',

  findExisting: async ({ subdomain }, _conversationId, relatedIds) => {
    if (!relatedIds.length) {
      return null;
    }

    return sendTRPCMessage({
      subdomain,
      pluginName: 'operation',
      method: 'query',
      module: 'task',
      action: 'findOne',
      input: { _ids: relatedIds },
      defaultValue: null,
    });
  },

  getUrl: async (_subdomain, { _id }) => `/operation/tasks/${_id}`,

  create: async (
    { subdomain, user, checkPermission },
    { doc, name, stageId, assignedUserIds },
  ) => {
    await checkPermission('taskCreate');

    const task: { _id: string } | undefined = await sendTRPCMessage({
      subdomain,
      pluginName: 'operation',
      method: 'mutation',
      module: 'task',
      action: 'createFromSource',
      input: {
        userId: user._id,
        doc: withoutNullish({
          name,
          status: stageId,
          description: doc.description,
          priority: toPriorityNumber(doc.priority),
          assigneeId: assignedUserIds[0],
          labelIds: doc.labelIds,
          tagIds: doc.tagIds,
          startDate: doc.startDate,
          targetDate: doc.closeDate,
          propertiesData: await validatePropertiesData(
            subdomain,
            doc.customFieldsData,
          ),
        }),
      },
      context: { userId: user._id },
      throwOnError: true,
    });

    if (!task?._id) {
      throw new Error('Operation plugin is not available');
    }

    return task._id;
  },
};

export const CONVERT_TARGET_HANDLERS: Record<
  ConversationConvertType,
  IConvertTargetHandler
> = {
  ticket: ticketHandler,
  deal: dealHandler,
  task: taskHandler,
};
