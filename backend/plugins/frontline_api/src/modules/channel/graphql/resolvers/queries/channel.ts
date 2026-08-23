import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IChannelFilter } from '@/channel/@types/channel';
import { teamChannelsOnly } from '@/channel/utils';
import { canGroup } from 'erxes-api-shared/core-modules';
import { escapeRegExp } from 'erxes-api-shared/utils';

// Sortable document paths. `memberCount` and the other counts are field
// resolvers rather than stored fields, and `updatedAt` is not a schema path,
// so none of them can be sorted on in the database.
const CHANNEL_SORT_FIELDS = ['name', 'createdAt'];

export const channelQueries = {
  getChannel: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Channels.getChannel(_id);
  },

  getMyChannels: async (
    _parent: undefined,
    {
      name,
      sortField = 'createdAt',
      sortDirection = -1,
    }: { name?: string; sortField?: string; sortDirection?: number },
    { models, user }: IContext,
  ) => {
    if (!user?._id) throw new Error('Unauthorized');
    const userId = user._id;
    const channelIds = await models.ChannelMembers.find({
      memberId: userId,
    }).distinct('channelId');

    const nameFilter = name
      ? { name: { $regex: escapeRegExp(name), $options: 'i' } }
      : {};

    // Sorting is resolved here rather than in the UI so the list stays ordered
    // across refetches. Unknown fields are rejected so a client cannot sort by
    // an arbitrary document path.
    const orderBy: Record<string, SortOrder> = {
      [CHANNEL_SORT_FIELDS.includes(sortField) ? sortField : 'createdAt']:
        sortDirection === 1 ? 1 : -1,
    };

    // Collated so `name` orders the way a reader expects — Mongo's default is
    // byte order, which files every capitalized name ahead of every lowercase
    // one. Strength 1 ignores case and diacritics, matching the locale-aware
    // comparison the sidebar previously did in the browser.
    return models.Channels.find({
      _id: { $in: channelIds },
      ...nameFilter,
    })
      .sort(orderBy)
      .collation({ locale: 'en', strength: 1 });
  },

  /*
   * Provisioning point for a user's private inbox: the channel is created the
   * first time it is actually asked for — opening its settings page, or
   * connecting a personal mailbox — rather than up front for every user.
   */
  getPersonalChannel: async (
    _parent: undefined,
    _params: undefined,
    { models, user }: IContext,
  ) => {
    if (!user?._id) throw new Error('Unauthorized');

    return models.Channels.getPersonalChannel(user._id);
  },

  getChannels: async (
    _parent: undefined,
    params: IChannelFilter,
    { models, user, subdomain }: IContext,
  ) => {
    const nameFilter = params.name
      ? { name: { $regex: escapeRegExp(params.name), $options: 'i' } }
      : {};

    // This listing is team channels only, on every branch. Personal inboxes are
    // reached through `getPersonalChannel`.
    const scopeFilter = teamChannelsOnly();
    const sort: { createdAt: SortOrder } | undefined =
      params.sortField === 'createdAt'
        ? { createdAt: params.sortDirection === 1 ? 1 : -1 }
        : undefined;

    if (params.channelIds && params.channelIds.length > 0) {
      const channelQuery = models.Channels.find({
        _id: { $in: params.channelIds },
        ...nameFilter,
        ...scopeFilter,
      });
      return sort ? channelQuery.sort(sort) : channelQuery;
    }

    if (params.integrationId) {
      const channelIds = await models.Integrations.distinct('channelId', {
        _id: params.integrationId,
      });
      const channelQuery = models.Channels.find({
        _id: { $in: channelIds },
        ...nameFilter,
        ...scopeFilter,
      });
      return sort ? channelQuery.sort(sort) : channelQuery;
    }

    // System owners and users with showAllChannels permission see every channel.
    if (user?.isOwner || (await canGroup(subdomain, 'showAllChannels', user))) {
      const channelQuery = models.Channels.find({
        ...nameFilter,
        ...scopeFilter,
      });
      return sort ? channelQuery.sort(sort) : channelQuery;
    }

    const userId = params.userId || user?._id;
    if (userId) {
      const channelIds = await models.ChannelMembers.find({
        memberId: userId,
      }).distinct('channelId');
      const channelQuery = models.Channels.find({
        _id: { $in: channelIds },
        ...nameFilter,
        ...scopeFilter,
      });
      return sort ? channelQuery.sort(sort) : channelQuery;
    }

    return [];
  },

  getChannelMembers: async (
    _parent: undefined,
    { channelId, channelIds }: { channelId: string; channelIds: string[] },
    { models }: IContext,
  ) => {
    if (channelIds && channelIds.length > 0) {
      return models.ChannelMembers.aggregate([
        {
          $match: {
            channelId: { $in: channelIds },
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $group: {
            _id: { channelId: '$channelId', memberId: '$memberId' },
            doc: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
        },
      ]);
    }
    return await models.ChannelMembers.find({ channelId });
  },
};
