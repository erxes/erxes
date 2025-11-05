import { fetchEs } from 'erxes-api-shared/utils';
import { sendCoreMessage, sendInboxMessage } from './messageBroker';
import { isUsingElk } from './utils';
import { CAMPAIGN_KINDS, CAMPAIGN_METHODS, CONTENT_TYPES } from './constants';
import { IModels } from '~/connectionResolvers';
import { IEngageMessage } from './@types/types';

interface ICustomerSelector {
  engageId?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}

interface ICheckCustomerParams {
  id?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}

export const findElk = async (subdomain: string, index: string, query) => {
  const response = await fetchEs({
    subdomain,
    action: 'search',
    index,
    body: {
      query,
    },
    defaultValue: { hits: { hits: [] } },
  });

  return response.hits.hits.map((hit) => {
    return {
      _id: hit._id,
      ...hit._source,
    };
  });
};

export const generateCustomerSelector = async (
  subdomain,
  {
    engageId,
    customerIds,
    segmentIds = [],
    tagIds = [],
    brandIds = [],
  }: ICustomerSelector,
): Promise<any> => {
  // find matched customers
  let customerQuery: any = {};

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
    const segments = await sendCoreMessage({
      ...commonParams,
      action: 'segmentFind',
      data: { _id: { $in: segmentIds } },
    });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const options: any = { perPage: 5000, scroll: true };

      if (!segment.contentType.includes('contacts')) {
        options.returnAssociated = {
          mainType: segment.contentType,
          relType: 'core:customer',
        };
      }

      const cIds = await sendCoreMessage({
        ...commonParams,
        action: 'fetchSegment',
        data: {
          segmentId: segment._id,
          options,
        },
      });

      if (
        engageId &&
        [
          'core:company',
          'sales:deal',
          'tasks:task',
          'tickets:ticket',
          'purchases:purchase',
        ].includes(segment.contentType)
      ) {
        const returnFields = [
          'name',
          'description',
          'closeDate',
          'createdAt',
          'modifiedAt',
          'customFieldsData',
        ];

        if (
          segment.contentType === 'sales:deal' ||
          segment.contentType === 'purchases:purchase'
        ) {
          returnFields.push('productsData');
        }
      }

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    } // end segments loop

    customerQuery = { _id: { $in: customerIdsBySegments } };
  } // end segmentIds if

  return {
    ...customerQuery,
    $or: [{ isSubscribed: 'Yes' }, { isSubscribed: { $exists: false } }],
  };
};

// check customer exists from elastic or mongo
export const checkCustomerExists = async (
  subdomain: string,
  params: ICheckCustomerParams,
) => {
  const { id, customerIds, segmentIds, tagIds, brandIds } = params;
  if (!isUsingElk()) {
    const customersSelector = {
      _id: id,
      state: { $ne: CONTENT_TYPES.VISITOR },
      ...(await generateCustomerSelector(subdomain, {
        customerIds,
        segmentIds,
        tagIds,
        brandIds,
      })),
    };

    const customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: customersSelector,
      isRPC: true,
    });

    return customer;
  }

  if (!id) {
    return false;
  }

  const must: any[] = [
    { terms: { state: [CONTENT_TYPES.CUSTOMER, CONTENT_TYPES.LEAD] } },
  ];

  must.push({
    term: {
      _id: id,
    },
  });

  if (customerIds && customerIds.length > 0) {
    must.push({ terms: { _id: customerIds } });
  }

  if (tagIds && tagIds.length > 0) {
    must.push({ terms: { tagIds } });
  }

  if (brandIds && brandIds.length > 0) {
    const integraiontIds = await findElk(subdomain, 'integrations', {
      bool: {
        must: [{ terms: { 'brandId.keyword': brandIds } }],
      },
    });

    must.push({
      terms: {
        integrationId: integraiontIds.map((e) => e._id),
      },
    });
  }

  if (segmentIds && segmentIds.length > 0) {
    const segments = await findElk(subdomain, 'segments', {
      bool: {
        must: [{ terms: { _id: segmentIds } }],
      },
    });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const cIds = await sendCoreMessage({
        isRPC: true,
        subdomain,
        action: 'fetchSegment',
        data: { segmentId: segment._id },
      });

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    must.push({
      terms: {
        _id: customerIdsBySegments,
      },
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
                field: 'isSubscribed',
              },
            },
          },
        },
      ],
    },
  });

  const customers = await findElk(subdomain, 'customers', {
    bool: {
      filter: {
        bool: {
          must,
        },
      },
    },
  });

  return customers.length > 0;
};

// find user from elastic or mongo
export const findUser = async (subdomain, userId?: string) => {
  const user = await sendCoreMessage({
    isRPC: true,
    subdomain,
    data: { _id: userId },
    action: 'users.findOne',
  });

  return user;
};

export const checkCampaignDoc = async (
  models: IModels,
  subdomain: string,
  doc: IEngageMessage,
) => {
  const {
    brandIds = [],
    kind,
    method,
    scheduleDate,
    segmentIds = [],
    customerTagIds = [],
    customerIds = [],
    fromUserId,
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

  if (method === CAMPAIGN_METHODS.EMAIL) {
    const user = await findUser(subdomain, fromUserId);

    if (!user) {
      throw new Error('From user must be specified');
    }

    if (!user.email) {
      throw new Error(`From user email is not specified: ${user.username}`);
    }

    const verifiedEmails: any =
      (await awsRequests.getVerifiedEmails(models)) || [];

    if (!verifiedEmails.includes(user.email)) {
      throw new Error(`From user email "${user.email}" is not verified in AWS`);
    }
  }

  if (method === CAMPAIGN_METHODS.NOTIFICATION) {
    if (!doc.notification || !doc.title || !doc?.notification.content) {
      throw new Error(
        'Required fields are missing. Please fill in all mandatory fields.',
      );
    }
    if (!doc.cpId) {
      throw new Error(
        'Please select "Clientportal" in the notification campaign',
      );
    }
  }
};
