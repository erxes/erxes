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
  channelId?: string;
  pipelineId?: string;
}

export interface IConvertTargetHandler {
  contentType: string;
  requiredStageMessage: string;
  // The item already made from the conversation, found by the
  // conversation kept on it (`sourceConversationIds`).
  findExisting: (
    context: Pick<IConvertContext, 'models' | 'subdomain'>,
    conversationId: string,
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
  requiredStageMessage: 'Status is required',

  findExisting: async ({ models }, conversationId) => {
    const ticket = await models.Ticket.findOne(
      {
        $or: [
          { sourceConversationIds: conversationId },
          // Tickets moved from the old ticket module keep it here.
          { 'customerFieldData.sourceConversationIds': conversationId },
        ],
        state: { $ne: 'deleted' },
      },
      { _id: 1, channelId: 1, pipelineId: 1 },
    ).lean();

    return ticket
      ? {
          _id: ticket._id,
          channelId: ticket.channelId,
          pipelineId: ticket.pipelineId,
        }
      : null;
  },

  getUrl: async (_subdomain, { _id, channelId, pipelineId }) => {
    const params = new URLSearchParams({
      ...(channelId && { channelId }),
      ...(pipelineId && { pipelineId }),
      ticketId: _id,
    });

    return `/frontline/tickets?${params.toString()}`;
  },

  create: async (
    { models, subdomain, user, checkPermission },
    { conversation, doc, name, stageId, assignedUserIds },
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
        // The ticket keeps its customer and source conversation itself.
        customerId: conversation.customerId || null,
        sourceConversationIds: [conversation._id],
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
  requiredStageMessage: 'Stage is required',

  findExisting: ({ subdomain }, conversationId) =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'deal',
      action: 'findOne',
      input: { sourceConversationIds: conversationId },
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
        customerId: conversation.customerId || null,
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

export const CONVERT_TARGET_HANDLERS: Record<
  ConversationConvertType,
  IConvertTargetHandler
> = {
  ticket: ticketHandler,
  deal: dealHandler,
};
