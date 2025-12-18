import { IEngageMessage } from '@/broadcast/@types';
import {
  CAMPAIGN_KINDS,
  CAMPAIGN_METHODS,
  CONTENT_TYPES,
} from '@/broadcast/constants';
import { awsRequests } from '@/broadcast/trackers';
import { isUsingElk } from '@/broadcast/utils';
import { fetchSegment } from '@/segments/utils/fetchSegment';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { fetchEs, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

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
  subdomain: string,
  models: IModels,
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

  if (brandIds.length > 0) {
    const integrations = await sendTRPCMessage({
      subdomain,
      pluginName: 'frontline',
      method: 'query',
      module: 'integrations',
      action: 'find',
      input: { query: { brandId: { $in: brandIds } } },
    });

    customerQuery = { integrationId: { $in: integrations.map((i) => i._id) } };
  }

  if (segmentIds.length > 0) {
    const segments = await models.Segments.find({
      _id: { $in: segmentIds },
    }).lean();

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const options: any = { perPage: 5000, scroll: true };

      if (!segment.contentType.includes('contacts')) {
        options.returnAssociated = {
          mainType: segment.contentType,
          relType: 'core:customer',
        };
      }

      const segmentData = await models.Segments.findOne({
        _id: segment._id,
      }).lean();

      const cIds = await fetchSegment(models, subdomain, segmentData, options);

      if (
        engageId &&
        [
          'core:company',
          'sales:deal',
          // "operation:task",
          'frontline:ticket',
          // "purchases:purchase"
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
          segment.contentType === 'sales:deal'
          // || segment.contentType === "purchases:purchase"
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
  models: IModels,
  params: ICheckCustomerParams,
) => {
  const { id, customerIds, segmentIds, tagIds, brandIds } = params;
  if (!isUsingElk()) {
    const customersSelector = {
      _id: id,
      state: { $ne: CONTENT_TYPES.VISITOR },
      ...(await generateCustomerSelector(subdomain, models, {
        customerIds,
        segmentIds,
        tagIds,
        brandIds,
      })),
    };

    const customer = await models.Customers.findOne(customersSelector).lean();

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
      const segmentData = await models.Segments.findOne({
        _id: segment._id,
      }).lean();

      const cIds = await fetchSegment(models, subdomain, segmentData);

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

export const checkCampaignDoc = async (
  models: IModels,
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
    const user = await models.Users.findOne({ _id: fromUserId }).lean();

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

const count = async (models: IModels, selector: {}): Promise<number> => {
  const res = await models.EngageMessages.find(selector).countDocuments();
  return Number(res);
};

// Tag query builder
const tagQueryBuilder = (tagId: string) => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (
  status: string,
  user?: IUserDocument,
):
  | {
      [index: string]: boolean | string;
    }
  | undefined => {
  if (status === 'live') {
    return { isLive: true };
  }

  if (status === 'draft') {
    return { isDraft: true };
  }

  if (status === 'yours' && user) {
    return { fromUserId: user._id };
  }

  // status is 'paused'
  return { isLive: false };
};

export const countsByKind = async (models: IModels) => ({
  all: await count(models, {}),
  auto: await count(models, { kind: 'auto' }),
  visitorAuto: await count(models, { kind: 'visitorAuto' }),
  manual: await count(models, { kind: 'manual' }),
});

// count for each status type
export const countsByStatus = async (
  models: IModels,
  { kind, user }: { kind: string; user },
): Promise<{
  [index: string]: number;
}> => {
  const query: {
    kind?: string;
  } = {};

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count(models, { ...query, ...statusQueryBuilder('live') }),
    draft: await count(models, { ...query, ...statusQueryBuilder('draft') }),
    paused: await count(models, { ...query, ...statusQueryBuilder('paused') }),
    yours: await count(models, {
      ...query,
      ...statusQueryBuilder('yours', user),
    }),
  };
};

// cout for each tag
export const countsByTag = async (
  models: IModels,
  {
    kind,
    status,
    user,
  }: {
    kind: string;
    status: string;
    user;
  },
): Promise<{
  [index: string]: number;
}> => {
  let query: any = {};

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await models.Tags.find({ type: 'broadcast:engageMessage' });

  const response: {
    [index: string]: number;
  } = {};

  for (const tag of tags) {
    response[tag._id] = await count(models, {
      ...query,
      ...tagQueryBuilder(tag._id),
    });
  }

  return response;
};
