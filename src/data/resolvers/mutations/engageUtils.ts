import {
  ConversationMessages,
  Conversations,
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Users,
} from '../../../db/models';
import { CONVERSATION_STATUSES, KIND_CHOICES, METHODS } from '../../../db/models/definitions/constants';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { IEngageMessageDocument } from '../../../db/models/definitions/engages';
import { IUserDocument } from '../../../db/models/definitions/users';
import { sendMessage } from '../../../messageBroker';
import { MESSAGE_KINDS } from '../../constants';
import { fetchBySegments } from '../../modules/segments/queryBuilder';

/**
 * Find customers
 */
export const findCustomers = async ({
  customerIds,
  segmentIds = [],
  tagIds = [],
  brandIds = [],
}: {
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}): Promise<ICustomerDocument[]> => {
  // find matched customers
  let customerQuery: any = {};

  if (customerIds && customerIds.length > 0) {
    customerQuery = { _id: { $in: customerIds } };
  }

  if (tagIds.length > 0) {
    customerQuery = { tagIds: { $in: tagIds } };
  }

  if (brandIds.length > 0) {
    let integrationIds: string[] = [];

    for (const brandId of brandIds) {
      const integrations = await Integrations.findIntegrations({ brandId });

      integrationIds = [...integrationIds, ...integrations.map(i => i._id)];
    }

    customerQuery = { integrationId: { $in: integrationIds } };
  }

  if (segmentIds.length > 0) {
    const segments = await Segments.find({ _id: { $in: segmentIds } });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const cIds = await fetchBySegments(segment);

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    customerQuery = { _id: { $in: customerIdsBySegments } };
  }

  return Customers.find({ $or: [{ doNotDisturb: 'No' }, { doNotDisturb: { $exists: false } }], ...customerQuery });
};

const sendQueueMessage = args => {
  return sendMessage('erxes-api:engages-notification', args);
};

export const send = async (engageMessage: IEngageMessageDocument) => {
  const { customerIds, segmentIds, tagIds, brandIds, fromUserId } = engageMessage;

  const user = await Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  if (!engageMessage.isLive) {
    return;
  }

  const customers = await findCustomers({ customerIds, segmentIds, tagIds, brandIds });

  // save matched customers count
  await EngageMessages.setCustomersCount(engageMessage._id, 'totalCustomersCount', customers.length);

  if (engageMessage.method === METHODS.EMAIL) {
    const engageMessageId = engageMessage._id;

    await sendQueueMessage({
      action: 'writeLog',
      data: {
        engageMessageId,
        msg: `Run at ${new Date()}`,
      },
    });

    const customerInfos = customers.map(customer => ({
      _id: customer._id,
      name: Customers.getCustomerName(customer),
      email: customer.primaryEmail,
      emailValidationStatus: customer.emailValidationStatus,
    }));

    const data = {
      email: engageMessage.email,
      customers: customerInfos,
      user: {
        email: user.email,
        name: user.details && user.details.fullName,
        position: user.details && user.details.position,
      },
      engageMessageId,
    };

    if (engageMessage.kind === MESSAGE_KINDS.MANUAL && customerInfos.length === 0) {
      await EngageMessages.deleteOne({ _id: engageMessage._id });
      throw new Error('No customers found');
    }

    await sendQueueMessage({
      action: 'writeLog',
      data: {
        engageMessageId,
        msg: `Matched ${customerInfos.length} customers`,
      },
    });

    await EngageMessages.setCustomersCount(engageMessage._id, 'validCustomersCount', customerInfos.length);

    if (data.customers.length > 0) {
      if (process.env.ENGAGE_ADMINS) {
        data.customers = [...customerInfos, ...JSON.parse(process.env.ENGAGE_ADMINS)];
      }

      await sendQueueMessage({ action: 'sendEngage', data });
    }
  }

  if (engageMessage.method === METHODS.MESSENGER && engageMessage.kind !== MESSAGE_KINDS.VISITOR_AUTO) {
    await sendViaMessenger(engageMessage, customers, user);
  }
};

/**
 * Send via messenger
 */
const sendViaMessenger = async (
  message: IEngageMessageDocument,
  customers: ICustomerDocument[],
  user: IUserDocument,
) => {
  const { fromUserId } = message;

  if (!message.messenger) {
    return;
  }

  const { brandId, content } = message.messenger;

  // find integration
  const integration = await Integrations.findOne({
    brandId,
    kind: KIND_CHOICES.MESSENGER,
  });

  if (integration === null) {
    throw new Error('Integration not found');
  }

  for (const customer of customers) {
    // replace keys in content
    const replacedContent = EngageMessages.replaceKeys({ content, customer, user });

    // create conversation
    const conversation = await Conversations.createConversation({
      userId: fromUserId,
      customerId: customer._id,
      integrationId: integration._id,
      content: replacedContent,
      status: CONVERSATION_STATUSES.NEW,
    });

    // create message
    await ConversationMessages.createMessage({
      engageData: {
        engageKind: 'auto',
        messageId: message._id,
        fromUserId,
        ...message.messenger.toJSON(),
      },
      conversationId: conversation._id,
      userId: fromUserId,
      customerId: customer._id,
      content: replacedContent,
    });
  }
};
