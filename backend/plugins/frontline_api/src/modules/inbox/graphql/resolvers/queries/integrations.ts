import { getIntegrationsKinds } from '@/inbox/utils';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate, markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { IChannelDocument } from '@/channel/@types/channel';

const generateFilterQuery = async ({
  subdomain,
  kind,
  channelId,
  searchValue,
  tag,
  status,
}) => {
  const query: any = {};

  if (kind) {
    query.kind = kind;
  }

  // filter integrations by channel
  if (channelId) {
    query.channelId = channelId;
  }

  if (searchValue) {
    query.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  // filtering integrations by tag
  if (tag) {
    try {
      const object = await sendTRPCMessage({
        subdomain,

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
    query.isActive = status === 'active';
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
      tag: string;
      status: string;
      formLoadType: string;
      sortField: string;
      sortDirection: number;
    } & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    let query = {
      ...(await generateFilterQuery({ subdomain, ...args })),
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
    try {
      const kindMap = await getIntegrationsKinds();
      const usedKinds: string[] = await models.Integrations.distinct('kind');

      return usedKinds
        .filter((kind) => kindMap[kind])
        .map((kind) => ({ _id: kind, name: kindMap[kind] }));
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
      // brandId: string;
      tag: string;
      searchValue: string;
      status: string;
      formLoadType: string;
    },
    { models, subdomain }: IContext,
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
      ...(await generateFilterQuery({ subdomain, ...args })),
    };

    const count = async (query) => {
      return models.Integrations.countDocuments(query);
    };

    const [tags, kindMap, channels] = await Promise.all([
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'tags',
        action: 'find',
        input: { type: 'inbox:integration' },
      }),
      getIntegrationsKinds(),
      models.Channels.find({}),
    ]);

    const tagCounts = await Promise.all(
      tags.map((tag) => count({ tagIds: tag._id, ...qry })),
    );
    for (let i = 0; i < tags.length; i++) {
      counts.byTag[tags[i]._id] =
        !args.tag || args.tag === tags[i]._id ? tagCounts[i] : 0;
    }

    const kinds = Object.keys(kindMap);
    const kindCounts = await Promise.all(
      kinds.map((kind) => count({ kind, ...qry })),
    );
    for (let i = 0; i < kinds.length; i++) {
      counts.byKind[kinds[i]] =
        !args.kind || args.kind === kinds[i] ? kindCounts[i] : 0;
    }

    const channelList = channels as IChannelDocument[];
    const channelCounts = await Promise.all(
      channelList.map((ch) => count({ channelId: ch._id, ...qry })),
    );
    for (let i = 0; i < channelList.length; i++) {
      const id = channelList[i]._id.toString();
      counts.byChannel[id] =
        !args.channelId || args.channelId === id ? channelCounts[i] : 0;
    }

    const [activeCount, archivedCount, total] = await Promise.all([
      count({ isActive: true, ...qry }),
      count({ isActive: false, ...qry }),
      count(qry),
    ]);

    counts.byStatus.active = args.status === 'archived' ? 0 : activeCount;
    counts.byStatus.archived = args.status === 'active' ? 0 : archivedCount;
    counts.total = total;

    return counts;
  },
};

markResolvers(integrationQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});

