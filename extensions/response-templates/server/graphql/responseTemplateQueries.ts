import { ExtensionError } from 'erxes-sdk/server';
import * as z from 'zod';
import type { IContext } from '../connectionResolver';
import {
  ExtResponseTemplatesChannelsDocument,
  ExtResponseTemplatesConversationChannelDocument,
  ExtResponseTemplatesTicketChannelDocument,
} from '../gql/graphql';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ListArgs = z.object({
  channelId: z.string().nullish(),
  searchValue: z.string().trim().max(200).nullish(),
  page: z.number().int().min(1).nullish(),
  perPage: z.number().int().min(1).max(100).nullish(),
});

export const responseTemplateQueries = {
  /** Templates newest first, optionally in one channel and matching a search on name or content. */
  async responseTemplatesList(
    _parent: undefined,
    args: z.input<typeof ListArgs>,
    { db }: IContext,
  ) {
    const { channelId, searchValue, page, perPage } = ListArgs.parse(args);
    const search = searchValue && {
      $regex: escapeRegExp(searchValue),
      $options: 'i',
    };
    const filter = {
      ...(channelId && { channelId }),
      ...(search && { $or: [{ name: search }, { content: search }] }),
    };
    const pageSize = perPage ?? 20;

    const [list, totalCount] = await Promise.all([
      db.ResponseTemplates.find(filter, {
        sort: { createdAt: -1 },
        skip: ((page ?? 1) - 1) * pageSize,
        limit: pageSize,
      }),
      db.ResponseTemplates.countDocuments(filter),
    ]);

    return { list, totalCount };
  },

  async responseTemplatesDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { db }: IContext,
  ) {
    const template = await db.ResponseTemplates.findOne({ _id });

    if (!template) {
      throw new ExtensionError('NOT_FOUND', 'Response template not found');
    }

    return template;
  },

  /** Channels the caller can see in frontline. */
  async responseTemplatesChannels(
    _parent: undefined,
    _args: Record<string, never>,
    { gql }: IContext,
  ) {
    const { getChannels } = await gql(ExtResponseTemplatesChannelsDocument);

    return (getChannels ?? []).flatMap((channel) =>
      channel ? [{ _id: channel._id, name: channel.name }] : [],
    );
  },

  /** The channel of the conversation or ticket a composer writes on, or null. */
  async responseTemplatesComposerChannel(
    _parent: undefined,
    { contentType, contentId }: { contentType: string; contentId: string },
    { gql }: IContext,
  ) {
    if (contentType === 'frontline:conversation') {
      const { conversationDetail } = await gql(
        ExtResponseTemplatesConversationChannelDocument,
        { _id: contentId },
      );

      return conversationDetail?.integration?.channelId ?? null;
    }

    if (contentType === 'frontline:ticket') {
      const { getTicket } = await gql(
        ExtResponseTemplatesTicketChannelDocument,
        { _id: contentId },
      );

      return getTicket?.channelId ?? null;
    }

    return null;
  },
};
