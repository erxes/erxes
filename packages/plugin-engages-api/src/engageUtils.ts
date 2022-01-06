import { Transform } from 'stream';
import { IUserDocument, ICustomerDocument } from '@erxes/common-types';
import { chunkArray } from '@erxes/api-utils';

import {
  Conformities,
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Users
} from '../../../db/models';
import {
  IEngageMessage,
  IEngageMessageDocument
} from './types';
import { CONTENT_TYPES } from '../../../db/models/definitions/segments';
import { fetchElk } from '../../../elasticsearch';
import { get, removeKey, set } from '../../../inmemoryStorage';
import messageBroker from '../../../messageBroker';
import { CAMPAIGN_KINDS, CAMPAIGN_METHODS } from './constants';
import { fetchSegment } from '../../modules/segments/queryBuilder';
import { isUsingElk } from '../../utils';
import EditorAttributeUtil from '../../editorAttributeUtils';

interface IEngageParams {
  engageMessage: IEngageMessageDocument;
  customersSelector: any;
  user: IUserDocument;
}

export const generateCustomerSelector = async ({
  engageId,
  customerIds,
  segmentIds = [],
  tagIds = [],
  brandIds = []
}: {
  engageId?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}): Promise<any> => {
  // find matched customers
  let customerQuery: any = {};
  let customersItemsMapping: { [key: string]: any } = {};

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
      const cIds = await fetchSegment(segment, {
        associatedCustomers: true
      });

      if (
        engageId &&
        ['company', 'deal', 'task', 'ticket'].includes(segment.contentType)
      ) {
        const returnFields = [
          'name',
          'description',
          'closeDate',
          'createdAt',
          'modifiedAt',
          'customFieldsData'
        ];

        if (segment.contentType === 'deal') {
          returnFields.push('productsData');
        }

        const items = await fetchSegment(segment, {
          returnFields
        });

        for (const item of items) {
          const cusIds = await Conformities.savedConformity({
            mainType: segment.contentType,
            mainTypeId: item._id,
            relTypes: ['customer']
          });

          for (const customerId of cusIds) {
            if (!customersItemsMapping[customerId]) {
              customersItemsMapping[customerId] = [];
            }

            customersItemsMapping[customerId].push({
              contentType: segment.contentType,
              name: item.name,
              description: item.description,
              closeDate: item.closeDate,
              createdAt: item.createdAt,
              modifiedAt: item.modifiedAt,
              customFieldsData: item.customFieldsData,
              productsData: item.productsData
            });
          }
        }
      }

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    customerQuery = { _id: { $in: customerIdsBySegments } };
  } // end segmentIds if

  await set(
    `${engageId}_customers_items_mapping`,
    JSON.stringify(customersItemsMapping)
  );

  customersItemsMapping = {};

  return {
    ...customerQuery,
    $or: [{ isSubscribed: 'Yes' }, { isSubscribed: { $exists: false } }]
  };
};

const sendQueueMessage = (args: any) => {
  return messageBroker().sendMessage('erxes-api:engages-notification', args);
};

export const send = async (engageMessage: IEngageMessageDocument) => {
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
    engageId: engageMessage._id,
    customerIds,
    segmentIds,
    tagIds: customerTagIds,
    brandIds
  });

  if (engageMessage.method === CAMPAIGN_METHODS.EMAIL) {
    return sendEmailOrSms(
      { engageMessage, customersSelector, user },
      'sendEngage'
    );
  }

  if (engageMessage.method === CAMPAIGN_METHODS.SMS) {
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

  const MINUTELY =
    engageMessage.scheduleDate && engageMessage.scheduleDate.type === 'minute';

  if (!(engageMessage.kind === CAMPAIGN_KINDS.AUTO && MINUTELY)) {
    await sendQueueMessage({
      action: 'writeLog',
      data: {
        engageMessageId,
        msg: `Run at ${new Date()}`
      }
    });
  }

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

  const editorAttributeUtil = new EditorAttributeUtil();
  const customerFields = await editorAttributeUtil.getCustomerFields(
    emailContent
  );

  const onFinishPiping = async () => {
    if (
      engageMessage.kind === CAMPAIGN_KINDS.MANUAL &&
      customerInfos.length === 0
    ) {
      await EngageMessages.deleteOne({ _id: engageMessage._id });
      throw new Error('No customers found');
    }

    if (
      !(
        engageMessage.kind === CAMPAIGN_KINDS.AUTO &&
        MINUTELY &&
        customerInfos.length === 0
      )
    ) {
      await sendQueueMessage({
        action: 'writeLog',
        data: {
          engageMessageId,
          msg: `Matched ${customerInfos.length} customers`
        }
      });
    }

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
        title: engageMessage.title,
        kind: engageMessage.kind
      };

      if (engageMessage.method === CAMPAIGN_METHODS.EMAIL && engageMessage.email) {
        const replacedContent = await editorAttributeUtil.replaceAttributes({
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

    await removeKey(`${engageMessage._id}_customers_items_mapping`);
  };

  const customersItemsMapping = JSON.parse(
    (await get(`${engageMessage._id}_customers_items_mapping`)) || '{}'
  );

  const customerTransformerStream = new Transform({
    objectMode: true,

    async transform(customer: ICustomerDocument, _encoding, callback) {
      const itemsMapping = customersItemsMapping[customer._id] || [null];

      for (const item of itemsMapping) {
        const replacers = await editorAttributeUtil.generateReplacers({
          content: emailContent,
          customer,
          item,
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
      }

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

  if (kind === CAMPAIGN_KINDS.AUTO && method === CAMPAIGN_METHODS.EMAIL && noDate) {
    throw new Error('Schedule date & type must be chosen in auto campaign');
  }

  if (
    kind !== CAMPAIGN_KINDS.VISITOR_AUTO &&
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
  const response = await fetchElk({
    action: 'search',
    index,
    body: {
      query
    },
    defaultValue: { hits: { hits: [] } }
  });

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
      const cIds = await fetchSegment(segment);

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
        { term: { isSubscribed: 'yes' } },
        {
          bool: {
            must_not: {
              exists: {
                field: 'isSubscribed'
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
