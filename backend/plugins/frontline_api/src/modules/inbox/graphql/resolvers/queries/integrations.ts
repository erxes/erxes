import { getIntegrationsKinds } from '@/inbox/utils';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IIntegrationDocument } from '~/modules/inbox/@types/integrations';
import { IChannelDocument } from '@/inbox/@types/channels';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
const generateFilterQuery = async (
  { kind, channelId, brandId, searchValue, tag, status },
  models,
) => {
  const query: any = {};

  if (kind) {
    query.kind = kind;
  }

  // filter integrations by channel
  if (channelId) {
    const channel = await models.Channels.getChannel(channelId);
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
    try {
      const object = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'tags',
        action: 'findOne',
        input: {
          type: 'inbox:integration',
        },
      });

      query.tagIds = { $in: [tag, ...(object?.relatedIds || [])] };
    } catch (error) {
      console.warn(
        'Failed to fetch related tags, using original tag only:',
        error,
      );
      query.tagIds = { $in: [tag] };
    }
  }

  if (status) {
    query.isActive = status === 'active' ? true : false;
  }

  return query;
};

export const integrationQueries = {
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
      sortField: string;
      sortDirection: number;
    } & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    let query = {
      ...(await generateFilterQuery(args, models)),
    };
    if (!user.isOwner) {
      query = {
        ...query,
        $or: [
          { visibility: { $exists: null } },
          { visibility: 'public' },
          {
            $and: [
              { visibility: 'private' },
              {
                $or: [
                  { createdUserId: user._id },
                  { departmentIds: { $in: user?.departmentIds || [] } },
                ],
              },
            ],
          },
        ],
      };
    }

    if (args.kind === 'lead') {
      return models.Integrations.findLeadIntegrations(query, args);
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IIntegrationDocument>({
        model: models.Integrations,
        params: args,
        query,
      });
    return { list, totalCount, pageInfo };
  },

  /**
   * Get lead all integration list
   */
  async allLeadIntegrations(_root, _args, { models }: IContext) {
    const query = {
      kind: 'lead',
    };

    return models.Integrations.findAllIntegrations(query).sort({ name: 1 });
  },

  /**
   * Get used integration types
   */
  async integrationsGetUsedTypes(_root, _args, { models }: IContext) {
    const usedTypes: Array<{ _id: string; name: string }> = [];

    try {
      const kindMap = await getIntegrationsKinds();

      for (const kind of Object.keys(kindMap)) {
        if (
          (await models.Integrations.findIntegrations({
            kind,
          }).countDocuments()) > 0
        ) {
          usedTypes.push({ _id: kind, name: kindMap[kind] });
        }
      }

      return usedTypes;
    } catch (error) {
      console.error('Error in integrationsGetUsedTypes:', error);
      throw new Error('Failed to fetch used integration types');
    }
  },

  /**
   * Get one integration
   */
  async integrationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Integrations.findOne({ _id });
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
      formLoadType: string;
    },
    { models }: IContext,
  ) {
    const counts = {
      total: 0,
      byTag: {},
      byChannel: {},
      byBrand: {},
      byKind: {},
      byStatus: { active: 0, archived: 0 },
    };

    const qry = {
      ...(await generateFilterQuery(args, models)),
    };

    const count = async (query) => {
      return models.Integrations.countDocuments(query);
    };

    const tags = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: {
        type: 'inbox:integration',
      },
    });

    for (const tag of tags) {
      const countQueryResult = await count({ tagIds: tag._id, ...qry });

      counts.byTag[tag._id] = !args.tag
        ? countQueryResult
        : args.tag === tag._id
        ? countQueryResult
        : 0;
    }

    // Counting integrations by kind
    const kindMap = await getIntegrationsKinds();

    for (const kind of Object.keys(kindMap)) {
      const countQueryResult = await count({ kind, ...qry });
      counts.byKind[kind] = !args.kind
        ? countQueryResult
        : args.kind === kind
        ? countQueryResult
        : 0;
    }

    // Counting integrations by channel
    const channels = await models.Channels.find({}); // No need for 'as IChannelDocument[]' if models.Channels is typed
    if (channels) {
      for (const channel of channels as IChannelDocument[]) {
        const countQueryResult = await count({
          _id: { $in: channel.integrationIds },
          ...qry,
        });

        counts.byChannel[channel._id as string] = !args.channelId
          ? countQueryResult
          : args.channelId === channel._id
          ? countQueryResult
          : 0;
      }
    }

    // Counting integrations by brand

    const brands = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'brands',
      action: 'find',
      input: {
        query: {},
      },
    });
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
    counts.total = await count(qry);

    return counts;
  },
};
