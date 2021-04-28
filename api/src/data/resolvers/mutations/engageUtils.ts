import { Transform } from 'stream';
import {
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Users
} from '../../../db/models';
import { METHODS } from '../../../db/models/definitions/constants';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import {
  IEngageMessage,
  IEngageMessageDocument
} from '../../../db/models/definitions/engages';
import { CONTENT_TYPES } from '../../../db/models/definitions/segments';
import { IUserDocument } from '../../../db/models/definitions/users';
import { fetchElk } from '../../../elasticsearch';
import messageBroker from '../../../messageBroker';
import { MESSAGE_KINDS } from '../../constants';
import { fetchBySegments } from '../../modules/segments/queryBuilder';
import { chunkArray, isUsingElk, replaceEditorAttributes } from '../../utils';

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
      const cIds = await fetchBySegments(segment, 'search', {
        associatedCustomers: true
      });

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    customerQuery = { _id: { $in: customerIdsBySegments } };
  }

  return {
    ...customerQuery,
    $or: [{ doNotDisturb: 'No' }, { doNotDisturb: { $exists: false } }]
  };
};

const sendQueueMessage = (args: any) => {
  return messageBroker().sendMessage('erxes-api:engages-notification', args);
};

/**
 * Sends campaign
 * @param engageMessage Campaign
 * @param smsLimit Configured number per SMS campaign
 */
export const send = async (
  engageMessage: IEngageMessageDocument,
  smsLimit?: number
) => {
  const {
    customerIds,
    segmentIds,
    customerTagIds,
    brandIds,
    fromUserId,
    scheduleDate,
    _id
  } = engageMessage;

  // Check for pre scheduled engages
  if (scheduleDate && scheduleDate.type === 'pre' && scheduleDate.dateTime) {
    const dateTime = new Date(scheduleDate.dateTime);
    const now = new Date();

    if (dateTime.getTime() > now.getTime()) {
      await sendQueueMessage({
        action: 'writeLog',
        data: {
          engageMessageId: _id,
          msg: `Campaign will run at "${dateTime.toLocaleString()}"`
        }
      });

      return;
    }
  }

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
    tagIds: customerTagIds,
    brandIds
  });

  if (engageMessage.method === METHODS.EMAIL) {
    return sendEmailOrSms(
      { engageMessage, customersSelector, user },
      'sendEngage'
    );
  }

  if (engageMessage.method === METHODS.SMS) {
    return sendEmailOrSms(
      { engageMessage, customersSelector, user },
      'sendEngageSms',
      smsLimit
    );
  }
};

// Prepares queue data to engages-email-sender
const sendEmailOrSms = async (
  { engageMessage, customersSelector, user }: IEngageParams,
  action: 'sendEngage' | 'sendEngageSms',
  smsLimit?: number
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

    if (customerInfos.length > 0) {
      await sendQueueMessage({
        action: 'writeLog',
        data: {
          engageMessageId,
          msg: `Matched ${customerInfos.length} customers`
        }
      });
    }

    await EngageMessages.setCustomersCount(
      engageMessage._id,
      'validCustomersCount',
      customerInfos.length
    );

    if (
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === 'pre'
    ) {
      await EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { 'scheduleDate.type': 'sent' } }
      );
    }

    if (customerInfos.length > 0) {
      const data: any = {
        customers: [],
        fromEmail: user.email,
        engageMessageId,
        shortMessage: engageMessage.shortMessage || {},
        createdBy: engageMessage.createdBy,
        title: engageMessage.title
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

      if (
        engageMessage.method === METHODS.SMS &&
        engageMessage.kind === MESSAGE_KINDS.AUTO
      ) {
        if (!smsLimit) {
          await sendQueueMessage({
            action: 'writeLog',
            data: {
              engageMessageId,
              msg: `Auto campaign SMS limit is not set: "${smsLimit}"`
            }
          });

          return;
        }

        if (smsLimit && customerInfos.length > smsLimit) {
          await sendQueueMessage({
            action: 'writeLog',
            data: {
              engageMessageId,
              msg: `Chosen "${customerInfos.length}" customers exceeded sms limit "${smsLimit}". Campaign will not run.`
            }
          });

          return;
        }

        await sendQueueMessage({
          action: 'writeLog',
          data: { engageMessageId, msg: `Preparing to send SMS campaign` }
        });
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

// check & validate campaign doc
export const checkCampaignDoc = (doc: IEngageMessage) => {
  const {
    brandIds = [],
    kind,
    method,
    scheduleDate,
    segmentIds = [],
    customerTagIds = [],
    customerIds = []
  } = doc;

  const noDate =
    !scheduleDate ||
    (scheduleDate && scheduleDate.type === 'pre' && !scheduleDate.dateTime);

  if (kind === MESSAGE_KINDS.AUTO && method === METHODS.EMAIL && noDate) {
    throw new Error('Schedule date & type must be chosen in auto campaign');
  }

  if (
    kind !== MESSAGE_KINDS.VISITOR_AUTO &&
    !(
      brandIds.length > 0 ||
      segmentIds.length > 0 ||
      customerTagIds.length > 0 ||
      customerIds.length > 0
    )
  ) {
    throw new Error('One of brand or segment or tag must be chosen');
  }
};

export const findElk = async (index, query) => {
  const response = await fetchElk(
    'search',
    index,
    {
      query
    },
    '',
    { hits: { hits: [] } }
  );

  return response.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });
};

// find user from elastic or mongo
export const findUser = async (userId: string) => {
  if (!isUsingElk()) {
    return await Users.findOne({ _id: userId });
  }

  const users = await findElk('users', {
    match: {
      _id: userId
    }
  });

  if (users.length > 0) {
    return users[0];
  }
};

// check customer exists from elastic or mongo
export const checkCustomerExists = async (
  id?: string,
  customerIds?: string[],
  segmentIds?: string[],
  tagIds?: string[],
  brandIds?: string[]
) => {
  if (!isUsingElk()) {
    const customersSelector = {
      _id: id,
      state: { $ne: CONTENT_TYPES.VISITOR },
      ...(await generateCustomerSelector({
        customerIds,
        segmentIds,
        tagIds,
        brandIds
      }))
    };

    return await Customers.findOne(customersSelector);
  }

  if (!id) {
    return false;
  }

  const must: any[] = [
    { terms: { state: [CONTENT_TYPES.CUSTOMER, CONTENT_TYPES.LEAD] } }
  ];

  must.push({
    term: {
      _id: id
    }
  });

  if (customerIds && customerIds.length > 0) {
    must.push({
      terms: {
        _id: customerIds
      }
    });
  }

  if (tagIds && tagIds.length > 0) {
    must.push({
      terms: {
        tagIds
      }
    });
  }

  if (brandIds && brandIds.length > 0) {
    const integraiontIds = await findElk('integrations', {
      bool: {
        must: [{ terms: { 'brandId.keyword': brandIds } }]
      }
    });

    must.push({
      terms: {
        integrationId: integraiontIds.map(e => e._id)
      }
    });
  }

  if (segmentIds && segmentIds.length > 0) {
    const segments = await findElk('segments', {
      bool: {
        must: [{ terms: { _id: segmentIds } }]
      }
    });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const cIds = await fetchBySegments(segment);

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    must.push({
      terms: {
        _id: customerIdsBySegments
      }
    });
  }

  must.push({
    bool: {
      should: [
        { term: { doNotDisturb: 'no' } },
        {
          bool: {
            must_not: {
              exists: {
                field: 'doNotDisturb'
              }
            }
          }
        }
      ]
    }
  });

  const customers = await findElk('customers', {
    bool: {
      filter: {
        bool: {
          must
        }
      }
    }
  });

  return customers.length > 0;
};
