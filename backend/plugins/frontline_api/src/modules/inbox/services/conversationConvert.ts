import { getConversationAssigneeIds } from '@/inbox/utils/conversationAssignees';
import { IModels } from '~/connectionResolvers';
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
import { logConversationFormSubmission } from '@/inbox/utils/conversationFormSubmission';

const CONVERT_TYPES = Object.keys(
  CONVERT_TARGET_HANDLERS,
) as ConversationConvertType[];

const isConversationConvertType = (
  type: string,
): type is ConversationConvertType =>
  CONVERT_TYPES.includes(type as ConversationConvertType);

const findConvertedTarget = (
  context: Pick<IConvertContext, 'models' | 'subdomain'>,
  conversationId: string,
  type: ConversationConvertType,
): Promise<IConvertedTarget | null> =>
  CONVERT_TARGET_HANDLERS[type].findExisting(context, conversationId);

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
      : getConversationAssigneeIds(conversation)
  ).filter((userId): userId is string => Boolean(userId));

  const itemId = await handler.create(context, {
    conversation,
    doc,
    name,
    stageId: doc.stageId,
    assignedUserIds,
  });

  // The item keeps the conversation itself (`sourceConversationIds`); no
  // relation is made. Its form submissions are logged on it.
  await logConversationFormSubmission({
    models,
    subdomain,
    conversationId: conversation._id,
    target: { contentType: handler.contentType, contentId: itemId },
    userId: user._id,
  });

  return itemId;
};
