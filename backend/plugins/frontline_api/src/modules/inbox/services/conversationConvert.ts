import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  ConversationConvertType,
  IConversationConvert,
  IConversationConvertedItem,
} from '@/inbox/@types/conversationConvert';
import {
  CONVERT_TARGET_HANDLERS,
  IConvertContext,
  IConvertedTarget,
} from '@/inbox/services/conversationConvertTargets';

const CONVERSATION_CONTENT_TYPE = 'frontline:conversation';

const CUSTOMER_CONTENT_TYPE = 'core:customer';

const CONVERT_TYPES = Object.keys(
  CONVERT_TARGET_HANDLERS,
) as ConversationConvertType[];

const isConversationConvertType = (
  type: string,
): type is ConversationConvertType =>
  CONVERT_TYPES.includes(type as ConversationConvertType);

const getRelatedIds = async (
  subdomain: string,
  conversationId: string,
  type: ConversationConvertType,
): Promise<string[]> => {
  const ids: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: CONVERSATION_CONTENT_TYPE,
      contentId: conversationId,
      relatedContentType: CONVERT_TARGET_HANDLERS[type].contentType,
    },
    defaultValue: [],
  });

  return ids.filter(Boolean);
};

const findConvertedTarget = async (
  context: Pick<IConvertContext, 'models' | 'subdomain'>,
  conversationId: string,
  type: ConversationConvertType,
): Promise<IConvertedTarget | null> => {
  const relatedIds = await getRelatedIds(
    context.subdomain,
    conversationId,
    type,
  );

  return CONVERT_TARGET_HANDLERS[type].findExisting(
    context,
    conversationId,
    relatedIds,
  );
};

const relateConvertedItem = async (
  subdomain: string,
  user: IUserDocument,
  conversation: IConversationDocument,
  type: ConversationConvertType,
  itemId: string,
) => {
  const { contentType, relateCustomer } = CONVERT_TARGET_HANDLERS[type];
  const item = { contentType, contentId: itemId };

  const relatedEntities = [
    { contentType: CONVERSATION_CONTENT_TYPE, contentId: conversation._id },
  ];

  if (relateCustomer && conversation.customerId) {
    relatedEntities.push({
      contentType: CUSTOMER_CONTENT_TYPE,
      contentId: conversation.customerId,
    });
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'relation',
    action: 'createMultipleRelations',
    input: {
      relations: relatedEntities.map((entity) => ({
        entities: [entity, item],
      })),
    },
    context: { userId: user._id },
    throwOnError: true,
  });
};

export const getConversationConvertedItems = async (
  models: IModels,
  subdomain: string,
  conversationId: string,
): Promise<IConversationConvertedItem[]> => {
  const items = await Promise.all(
    CONVERT_TYPES.map(async (type) => {
      const target = await findConvertedTarget(
        { models, subdomain },
        conversationId,
        type,
      );

      if (!target?._id) {
        return null;
      }

      return {
        type,
        _id: target._id,
        url: await CONVERT_TARGET_HANDLERS[type].getUrl(subdomain, target),
      };
    }),
  );

  return items.filter((item): item is IConversationConvertedItem =>
    Boolean(item),
  );
};

export const convertConversation = async (
  context: IConvertContext,
  doc: IConversationConvert,
): Promise<string> => {
  const { models, subdomain, user } = context;
  const { type } = doc;

  if (!isConversationConvertType(type)) {
    throw new Error(`Unsupported convert type: ${type}`);
  }

  const handler = CONVERT_TARGET_HANDLERS[type];
  const name = doc.itemName?.trim();

  if (!name) {
    throw new Error('Name is required');
  }

  if (!doc.stageId) {
    throw new Error(handler.requiredStageMessage);
  }

  const conversation = await models.Conversations.getConversation(doc._id);

  const existing = await findConvertedTarget(context, conversation._id, type);

  if (existing?._id) {
    throw new Error(`Already converted a ${type}`);
  }

  const assignedUserIds = (
    doc.assignedUserIds?.length
      ? doc.assignedUserIds
      : [conversation.assignedUserId]
  ).filter((userId): userId is string => Boolean(userId));

  const itemId = await handler.create(context, {
    conversation,
    doc,
    name,
    stageId: doc.stageId,
    assignedUserIds,
  });

  await relateConvertedItem(subdomain, user, conversation, type, itemId);

  return itemId;
};
