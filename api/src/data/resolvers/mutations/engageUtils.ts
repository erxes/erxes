import * as Random from 'meteor-random';
import { Transform, Writable } from 'stream';
import {
  ConversationMessages,
  Conversations,
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Users
} from '../../../db/models';
import {
  CONVERSATION_STATUSES,
  KIND_CHOICES,
  METHODS
} from '../../../db/models/definitions/constants';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { IEngageMessageDocument } from '../../../db/models/definitions/engages';
import { IUserDocument } from '../../../db/models/definitions/users';
import { debugBase } from '../../../debuggers';
import messageBroker from '../../../messageBroker';
import { MESSAGE_KINDS } from '../../constants';
import { fetchBySegments } from '../../modules/segments/queryBuilder';
import { chunkArray, replaceEditorAttributes } from '../../utils';

interface IEngageParams {
  engageMessage: IEngageMessageDocument;
  customersSelector: any;
  user: IUserDocument;
}

export const generateCustomerSelector = async ({
  customerIds,
  segmentIds = [],
  tagIds = [],
  brandIds = []
}: {
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}): Promise<any> => {
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

  return {
    $or: [{ doNotDisturb: 'No' }, { doNotDisturb: { $exists: false } }],
    ...customerQuery
  };
};

const sendQueueMessage = (args: any) => {
  return messageBroker().sendMessage('erxes-api:engages-notification', args);
};

export const send = async (engageMessage: IEngageMessageDocument) => {
  const {
    customerIds,
    segmentIds,
    tagIds,
    brandIds,
    fromUserId
  } = engageMessage;

  const user = await Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  if (!engageMessage.isLive) {
    return;
  }

  const customersSelector = await generateCustomerSelector({
    customerIds,
    segmentIds,
    tagIds,
    brandIds
  });

  if (
    engageMessage.method === METHODS.MESSENGER &&
    engageMessage.kind !== MESSAGE_KINDS.VISITOR_AUTO
  ) {
    return sendViaMessenger({ engageMessage, customersSelector, user });
  }

  if (engageMessage.method === METHODS.EMAIL) {
    return sendEmailOrSms(
      { engageMessage, customersSelector, user },
      'sendEngage'
    );
  }

  if (engageMessage.method === METHODS.SMS) {
    return sendEmailOrSms(
      { engageMessage, customersSelector, user },
      'sendEngageSms'
    );
  }
};

// Prepares queue data to engages-email-sender
const sendEmailOrSms = async (
  { engageMessage, customersSelector, user }: IEngageParams,
  action: 'sendEngage' | 'sendEngageSms'
) => {
  const engageMessageId = engageMessage._id;

  await sendQueueMessage({
    action: 'writeLog',
    data: {
      engageMessageId,
      msg: `Run at ${new Date()}`
    }
  });

  const customerInfos: Array<{
    _id: string;
    primaryEmail?: string;
    emailValidationStatus?: string;
    phoneValidationStatus?: string;
    primaryPhone?: string;
    replacers: Array<{ key: string; value: string }>;
  }> = [];
  const emailConf = engageMessage.email ? engageMessage.email : { content: '' };
  const emailContent = emailConf.content || '';

  const { customerFields } = await replaceEditorAttributes({
    content: emailContent
  });

  const onFinishPiping = async () => {
    if (
      engageMessage.kind === MESSAGE_KINDS.MANUAL &&
      customerInfos.length === 0
    ) {
      await EngageMessages.deleteOne({ _id: engageMessage._id });
      throw new Error('No customers found');
    }

    // save matched customers count
    await EngageMessages.setCustomersCount(
      engageMessage._id,
      'totalCustomersCount',
      customerInfos.length
    );

    await sendQueueMessage({
      action: 'writeLog',
      data: {
        engageMessageId,
        msg: `Matched ${customerInfos.length} customers`
      }
    });

    await EngageMessages.setCustomersCount(
      engageMessage._id,
      'validCustomersCount',
      customerInfos.length
    );

    if (customerInfos.length > 0) {
      const data: any = {
        customers: [],
        fromEmail: user.email,
        engageMessageId,
        shortMessage: engageMessage.shortMessage || {}
      };

      if (engageMessage.method === METHODS.EMAIL && engageMessage.email) {
        const { replacedContent } = await replaceEditorAttributes({
          customerFields,
          content: emailContent,
          user
        });

        engageMessage.email.content = replacedContent;

        data.email = engageMessage.email;
      }

      const chunks = chunkArray(customerInfos, 3000);

      for (const chunk of chunks) {
        data.customers = chunk;

        await sendQueueMessage({ action, data });
      }
    }
  };

  const customerTransformerStream = new Transform({
    objectMode: true,

    async transform(customer: ICustomerDocument, _encoding, callback) {
      const { replacers } = await replaceEditorAttributes({
        content: emailContent,
        customer,
        customerFields
      });

      customerInfos.push({
        _id: customer._id,
        primaryEmail: customer.primaryEmail,
        emailValidationStatus: customer.emailValidationStatus,
        phoneValidationStatus: customer.phoneValidationStatus,
        primaryPhone: customer.primaryPhone,
        replacers
      });

      // signal upstream that we are ready to take more data
      callback();
    }
  });

  // generate fields option =======
  const fieldsOption = {
    primaryEmail: 1,
    emailValidationStatus: 1,
    phoneValidationStatus: 1,
    primaryPhone: 1
  };

  for (const field of customerFields || []) {
    fieldsOption[field] = 1;
  }

  const customersStream = (Customers.find(
    customersSelector,
    fieldsOption
  ) as any).stream();

  return new Promise((resolve, reject) => {
    const pipe = customersStream.pipe(customerTransformerStream);

    pipe.on('finish', async () => {
      try {
        await onFinishPiping();
      } catch (e) {
        return reject(e);
      }

      resolve('done');
    });
  });
};

/**
 * Send via messenger
 */
const sendViaMessenger = async ({
  engageMessage,
  customersSelector,
  user
}: IEngageParams) => {
  const { fromUserId, messenger, _id } = engageMessage;

  if (!messenger) {
    return;
  }

  const { brandId, content } = messenger;

  // find integration
  const integration = await Integrations.findOne({
    brandId,
    kind: KIND_CHOICES.MESSENGER
  });

  if (integration === null) {
    throw new Error('Integration not found');
  }

  const bulkSize = 1000;

  let iteratorCounter = 0;
  let conversationsBulk = Conversations.collection.initializeOrderedBulkOp();
  let conversationMessagesBulk = ConversationMessages.collection.initializeOrderedBulkOp();

  const customerFields = { firstName: 1, lastName: 1, primaryEmail: 1 };
  const customersStream = (Customers.find(
    customersSelector,
    customerFields
  ) as any).stream();

  const executeBulks = () => {
    return new Promise((resolve, reject) => {
      /* istanbul ignore next */
      conversationsBulk.execute(err => {
        if (err) {
          if (err.message === 'Invalid Operation, no operations specified') {
            debugBase(`Error during execute bulk ${err.message}`);
            return resolve('done');
          }

          return reject(err);
        }

        conversationMessagesBulk.execute(msgErr => {
          if (msgErr) {
            return reject(msgErr);
          }

          conversationsBulk = Conversations.collection.initializeOrderedBulkOp();
          conversationMessagesBulk = ConversationMessages.collection.initializeOrderedBulkOp();

          resolve('done');
        });
      });
    });
  };

  const createConversations = async (customer: ICustomerDocument) => {
    iteratorCounter++;

    // replace keys in content
    const { replacedContent } = await replaceEditorAttributes({
      content,
      customer,
      user
    });

    const now = new Date();
    const conversationId = Random.id();

    // create conversation
    conversationsBulk.insert({
      _id: conversationId,
      status: CONVERSATION_STATUSES.NEW,
      createdAt: now,
      updatedAt: now,
      userId: fromUserId,
      customerId: customer._id,
      integrationId: integration._id,
      content: replacedContent,
      messageCount: 1
    });

    // create message
    conversationMessagesBulk.insert({
      engageData: {
        engageKind: 'auto',
        messageId: _id,
        fromUserId,
        ...(messenger ? messenger.toJSON() : {}),
        content: replacedContent
      },
      internal: false,
      conversationId,
      userId: fromUserId,
      customerId: customer._id,
      content: replacedContent
    });

    /* istanbul ignore next */
    if (iteratorCounter % bulkSize === 0) {
      customersStream.pause();

      await executeBulks();

      customersStream.resume();
    }
  };

  const streamConversationWriter = new Writable({
    objectMode: true,

    async write(data, _encoding, callback) {
      await createConversations(data);

      callback();
    }
  });

  return new Promise(resolve => {
    const pipe = customersStream.pipe(streamConversationWriter);

    pipe.on('finish', async () => {
      // save matched customers count
      await EngageMessages.setCustomersCount(
        _id,
        'totalCustomersCount',
        iteratorCounter
      );

      if (iteratorCounter % bulkSize !== 0) {
        await executeBulks();
      }

      resolve('done');
    });
  });
}; // end sendViaMessenger()
