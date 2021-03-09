import { Brands, Channels, Integrations, Tags } from '../../../db/models';
import {
  INTEGRATION_NAMES_MAP,
  KIND_CHOICES,
  TAG_TYPES
} from '../../../db/models/definitions/constants';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';

import messageBroker from '../../../messageBroker';
import { RABBITMQ_QUEUES } from '../../constants';
import { IContext } from '../../types';
import { paginate } from '../../utils';
/**
 * Common helper for integrations & integrationsTotalCount
 */
const generateFilterQuery = async ({
  kind,
  channelId,
  brandId,
  searchValue,
  tag,
  status,
  formLoadType
}) => {
  const query: any = {};

  if (kind) {
    query.kind = kind;
  }

  if (kind === 'mail') {
    query.kind = {
      $in: [
        'gmail',
        'nylas-gmail',
        'nylas-imap',
        'nylas-office365',
        'nylas-outlook',
        'nylas-yahoo',
        'nylas-exchange'
      ]
    };
  }

  // filter integrations by channel
  if (channelId) {
    const channel = await Channels.getChannel(channelId);
    query._id = { $in: channel.integrationIds || [] };
  }

  // filter integrations by brand
  if (brandId) {
    query.brandId = brandId;
  }

  if (searchValue) {
    query.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  // filtering integrations by tag
  if (tag) {
    const object = await Tags.findOne({ _id: tag });

    query.tagIds = { $in: [tag, ...(object?.relatedIds || [])] };
  }

  if (status) {
    query.isActive = status === 'active' ? true : false;
  }

  if (formLoadType) {
    query['leadData.loadType'] = formLoadType;
  }

  return query;
};

const integrationQueries = {
  /**
   * Integrations list
   */
  async integrations(
    _root,
    args: {
      page: number;
      perPage: number;
      kind: string;

      searchValue: string;
      channelId: string;
      brandId: string;
      tag: string;
      status: string;
      formLoadType: string;
    },
    { singleBrandIdSelector }: IContext
  ) {
    const query = {
      ...singleBrandIdSelector,
      ...(await generateFilterQuery(args))
    };

    const integrations = paginate(
      Integrations.findAllIntegrations(query),
      args
    );

    return integrations.sort({ name: 1 });
  },

  /**
   * Get used integration types
   */
  async integrationsGetUsedTypes(_root, {}) {
    const usedTypes: Array<{ _id: string; name: string }> = [];

    for (const kind of KIND_CHOICES.ALL) {
      if (
        (await Integrations.findIntegrations({ kind }).countDocuments()) > 0
      ) {
        usedTypes.push({ _id: kind, name: INTEGRATION_NAMES_MAP[kind] });
      }
    }

    return usedTypes;
  },

  /**
   * Get one integration
   */
  integrationDetail(_root, { _id }: { _id: string }) {
    return Integrations.findOne({ _id });
  },

  /**
   * Get all integrations count. We will use it in pager
   */
  async integrationsTotalCount(
    _root,
    args: {
      kind: string;
      channelId: string;
      brandId: string;
      tag: string;
      searchValue: string;
      status: string;
    }
  ) {
    const counts = {
      total: 0,
      byTag: {},
      byChannel: {},
      byBrand: {},
      byKind: {},
      byStatus: { active: 0, archived: 0 }
    };

    const qry = {
      ...(await generateFilterQuery(args))
    };

    const count = async query => {
      return Integrations.findAllIntegrations(query).countDocuments();
    };

    // Counting integrations by tag
    const tags = await Tags.find({ type: TAG_TYPES.INTEGRATION });

    for (const tag of tags) {
      const countQueryResult = await count({ tagIds: tag._id, ...qry });
      counts.byTag[tag._id] = !args.tag
        ? countQueryResult
        : args.tag === tag._id
        ? countQueryResult
        : 0;
    }

    // Counting integrations by kind

    for (const kind of KIND_CHOICES.ALL) {
      const countQueryResult = await count({ kind, ...qry });
      counts.byKind[kind] = !args.kind
        ? countQueryResult
        : args.kind === kind
        ? countQueryResult
        : 0;
    }

    // Counting integrations by channel
    const channels = await Channels.find({});

    for (const channel of channels) {
      const countQueryResult = await count({
        _id: { $in: channel.integrationIds },
        ...qry
      });

      counts.byChannel[channel._id] = !args.channelId
        ? countQueryResult
        : args.channelId === channel._id
        ? countQueryResult
        : 0;
    }

    // Counting integrations by brand
    const brands = await Brands.find({});

    for (const brand of brands) {
      const countQueryResult = await count({ brandId: brand._id, ...qry });
      counts.byBrand[brand._id] = !args.brandId
        ? countQueryResult
        : args.brandId === brand._id
        ? countQueryResult
        : 0;
    }

    counts.byStatus.active = await count({ isActive: true, ...qry });
    counts.byStatus.archived = await count({ isActive: false, ...qry });

    if (args.status) {
      if (args.status === 'active') {
        counts.byStatus.archived = 0;
      } else {
        counts.byStatus.active = 0;
      }
    }

    // Counting all integrations without any filter
    counts.total = await count({});

    return counts;
  },

  /**
   * Fetch integrations api
   */
  integrationsFetchApi(
    _root,
    { path, params }: { path: string; params: { [key: string]: string } },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.fetchApi(path, params);
  },

  async integrationGetLineWebhookUrl(_root, { _id }: { _id: string }) {
    return messageBroker().sendRPCMessage(
      RABBITMQ_QUEUES.RPC_API_TO_INTEGRATIONS,
      {
        action: 'line-webhook',
        data: { _id }
      }
    );
  }
};

moduleRequireLogin(integrationQueries);

checkPermission(integrationQueries, 'integrations', 'showIntegrations', []);

export default integrationQueries;
