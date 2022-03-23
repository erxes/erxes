import { CAMPAIGN_KINDS, CAMPAIGN_METHODS } from './constants';
// import { fetchElk } from '../../../elasticsearch';
// import { get, removeKey, set } from '../../../inmemoryStorage';
// import { CONTENT_TYPES } from '@erxes/api-utils/src/constants';
import {
  IEngageMessage,
  IEngageMessageDocument,
} from './models/definitions/engages';
import { isUsingElk } from './utils';
import {
  sendInboxMessage,
  sendCoreMessage,
  sendSegmentsMessage,
  sendContactsMessage
} from './messageBroker';
import { IModels } from './connectionResolver';
import { es } from './configs';

interface IEngageParams {
  engageMessage: IEngageMessageDocument;
  customersSelector: any;
  user;
}

interface ICustomerSelector {
  engageId?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}

export const generateCustomerSelector = async (subdomain, {
  engageId,
  customerIds,
  segmentIds = [],
  tagIds = [],
  brandIds = [],
}: ICustomerSelector): Promise<any> => {
  // find matched customers
  let customerQuery: any = {};
  const customersItemsMapping: { [key: string]: any } = {};

  if (customerIds && customerIds.length > 0) {
    customerQuery = { _id: { $in: customerIds } };
  }

  if (tagIds.length > 0) {
    customerQuery = { tagIds: { $in: tagIds } };
  }

  const commonParams = { subdomain, isRPC: true };

  if (brandIds.length > 0) {
    const integrations = await sendInboxMessage({
      ...commonParams,
      action: 'integrations.find',
      data: { query: { brandId: { $in: brandIds } } },
    });

    customerQuery = { integrationId: { $in: integrations.map((i) => i._id) } };
  }

  if (segmentIds.length > 0) {
    const segments = await sendSegmentsMessage({
      ...commonParams,
      action: 'find',
      data: { _id: { $in: segmentIds } }
    });

    let customerIdsBySegments: string[] = [];

    const segmentOptions: any = {
      associatedCustomers: true,
      perPage: 5000,
      scroll: true
    };

    for (const segment of segments) {
      const cIds = await sendSegmentsMessage({
        ...commonParams,
        action: 'fetchSegment',
        data: { segmentId: segment._id, options: segmentOptions }
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
          'customFieldsData',
        ];

        if (segment.contentType === 'deal') {
          returnFields.push('productsData');
        }

        const items = await sendSegmentsMessage({
          ...commonParams,
          action: 'fetchSegment',
          data: { options: { returnFields }, segmentId: segment._id },
        });

        for (const item of items) {
          const cusIds = await sendCoreMessage({
            ...commonParams,
            action: 'conformities.savedConformity',
            data: {
              mainType: segment.contentType,
              mainTypeId: item._id,
              relTypes: ['customer'],
            }
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
              productsData: item.productsData,
            });
          }
        } // end items loop
      }

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    } // end segments loop

    customerQuery = { _id: { $in: customerIdsBySegments } };
  } // end segmentIds if

  // await set(
  //   `${engageId}_customers_items_mapping`,
  //   JSON.stringify(customersItemsMapping)
  // );

  // customersItemsMapping = {};

  return {
    ...customerQuery,
    $or: [{ isSubscribed: 'Yes' }, { isSubscribed: { $exists: false } }],
  };
};

export const send = async (
  models: IModels,
  subdomain: string,
  engageMessage: IEngageMessageDocument
) => {
  const {
    customerIds,
    segmentIds,
    customerTagIds,
    brandIds,
    fromUserId,
    scheduleDate,
    _id,
  } = engageMessage;

  // Check for pre scheduled engages
  if (scheduleDate && scheduleDate.type === 'pre' && scheduleDate.dateTime) {
    const dateTime = new Date(scheduleDate.dateTime);
    const now = new Date();

    if (dateTime.getTime() > now.getTime()) {
      await models.Logs.createLog(
        _id,
        'regular',
        `Campaign will run at "${dateTime.toLocaleString()}"`
      );

      return;
    }
  }

  const user = await findUser(subdomain, fromUserId);

  if (!user) {
    throw new Error('User not found');
  }

  if (!engageMessage.isLive) {
    return;
  }

  const customersSelector = await generateCustomerSelector(subdomain, {
    engageId: engageMessage._id,
    customerIds,
    segmentIds,
    tagIds: customerTagIds,
    brandIds,
  });

  if (engageMessage.method === CAMPAIGN_METHODS.EMAIL) {
    return sendEmailOrSms(
      models,
      subdomain,
      { engageMessage, customersSelector, user },
      'sendEngage'
    );
  }

  if (engageMessage.method === CAMPAIGN_METHODS.SMS) {
    return sendEmailOrSms(
      models,
      subdomain,
      { engageMessage, customersSelector, user },
      'sendEngageSms'
    );
  }
};

const sendEmailOrSms = async (
  models: IModels,
  subdomain,
  { engageMessage, customersSelector, user }: IEngageParams,
  action: 'sendEngage' | 'sendEngageSms'
) => {
  const engageMessageId = engageMessage._id;

  const MINUTELY =
    engageMessage.scheduleDate && engageMessage.scheduleDate.type === 'minute';

  if (!(engageMessage.kind === CAMPAIGN_KINDS.AUTO && MINUTELY)) {
    await models.Logs.createLog(
      engageMessageId,
      'regular',
      `Run at ${new Date()}`
    );
  }

  // customer info will be prepared at contacts api
  sendContactsMessage({
    isRPC: false,
    action: 'customers.prepareEngageCustomers',
    subdomain,
    data: {
      engageMessage,
      customersSelector,
      action,
      user,
    }
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
    customerIds = [],
  } = doc;

  const noDate =
    !scheduleDate ||
    (scheduleDate && scheduleDate.type === 'pre' && !scheduleDate.dateTime);

  if (
    kind === CAMPAIGN_KINDS.AUTO &&
    method === CAMPAIGN_METHODS.EMAIL &&
    noDate
  ) {
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

// export const findElk = async (index, query) => {
//   const response = await fetchElk({
//     action: 'search',
//     index,
//     body: {
//       query
//     },
//     defaultValue: { hits: { hits: [] } }
//   });

//   return response.hits.hits.map(hit => {
//     return {
//       _id: hit._id,
//       ...hit._source
//     };
//   });
// };

// find user from elastic or mongo
export const findUser = async (subdomain, userId?: string) => {
  const user = await sendCoreMessage({
    isRPC: true,
    subdomain,
    data: { _id: userId },
    action: 'users.findOne'
  });
  
  return user;
};

// check customer exists from elastic or mongo
// export const checkCustomerExists = async (
//   id?: string,
//   customerIds?: string[],
//   segmentIds?: string[],
//   tagIds?: string[],
//   brandIds?: string[]
// ) => {
//   if (!isUsingElk()) {
//     const customersSelector = {
//       _id: id,
//       state: { $ne: CONTENT_TYPES.VISITOR },
//       ...(await generateCustomerSelector({
//         customerIds,
//         segmentIds,
//         tagIds,
//         brandIds
//       }))
//     };

//     return await Customers.findOne(customersSelector);
//   }

//   if (!id) {
//     return false;
//   }

//   const must: any[] = [
//     { terms: { state: [CONTENT_TYPES.CUSTOMER, CONTENT_TYPES.LEAD] } }
//   ];

//   must.push({
//     term: {
//       _id: id
//     }
//   });

//   if (customerIds && customerIds.length > 0) {
//     must.push({
//       terms: {
//         _id: customerIds
//       }
//     });
//   }

//   if (tagIds && tagIds.length > 0) {
//     must.push({
//       terms: {
//         tagIds
//       }
//     });
//   }

//   if (brandIds && brandIds.length > 0) {
//     const integraiontIds = await findElk('integrations', {
//       bool: {
//         must: [{ terms: { 'brandId.keyword': brandIds } }]
//       }
//     });

//     must.push({
//       terms: {
//         integrationId: integraiontIds.map(e => e._id)
//       }
//     });
//   }

//   if (segmentIds && segmentIds.length > 0) {
//     const segments = await findElk('segments', {
//       bool: {
//         must: [{ terms: { _id: segmentIds } }]
//       }
//     });

//     let customerIdsBySegments: string[] = [];

//     for (const segment of segments) {
//       const cIds = await fetchSegment(segment);

//       customerIdsBySegments = [...customerIdsBySegments, ...cIds];
//     }

//     must.push({
//       terms: {
//         _id: customerIdsBySegments
//       }
//     });
//   }

//   must.push({
//     bool: {
//       should: [
//         { term: { isSubscribed: 'yes' } },
//         {
//           bool: {
//             must_not: {
//               exists: {
//                 field: 'isSubscribed'
//               }
//             }
//           }
//         }
//       ]
//     }
//   });

//   const customers = await findElk('customers', {
//     bool: {
//       filter: {
//         bool: {
//           must
//         }
//       }
//     }
//   });

//   return customers.length > 0;
// };
