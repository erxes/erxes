import {
  ICursorPaginateParams,
  IUserDocument,
  Resolver,
} from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { IPollDocument } from '@/poll/@types/poll';
import { IContext, IModels } from '~/connectionResolvers';

type PollFilterArgs = {
  searchValue?: string;
  status?: string;
  channelId?: string;
};

type PollListArgs = PollFilterArgs & ICursorPaginateParams;

const generateFilterQuery = async (
  { searchValue, status, channelId }: PollFilterArgs,
  models: IModels,
  user: IUserDocument,
) => {
  const query: Record<string, unknown> = {};
  const conditions: Record<string, unknown>[] = [];

  if (status) {
    query.status = status;
  }

  if (searchValue) {
    const regex = new RegExp(escapeRegExp(searchValue), 'i');
    conditions.push({ $or: [{ title: regex }, { question: regex }] });
  }

  if (channelId) {
    query.channelId = channelId;
  } else if (!user?.isOwner) {
    const memberships = await models.ChannelMembers.find({
      memberId: user._id,
    }).lean();

    conditions.push({
      $or: [
        { channelId: { $in: memberships.map((member) => member.channelId) } },
        { channelId: null },
      ],
    });
  }

  if (conditions.length) {
    query.$and = conditions;
  }

  return query;
};

export const pollQueries: Record<string, Resolver> = {
  async pollList(_root, args: PollListArgs, context) {
    const { models, user } = context as IContext;

    return cursorPaginate<IPollDocument>({
      model: models.Polls,
      params: { ...args, orderBy: args.orderBy || { createdAt: -1 } },
      query: await generateFilterQuery(args, models, user),
    });
  },

  async pollDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Polls.getPoll(_id);
  },

  async pollTotalCount(_root, args: PollFilterArgs, context) {
    const { models, user } = context as IContext;
    const query = await generateFilterQuery(args, models, user);

    const [total, active, archived] = await Promise.all([
      models.Polls.countDocuments(query),
      models.Polls.countDocuments({ ...query, status: 'active' }),
      models.Polls.countDocuments({ ...query, status: 'archived' }),
    ]);

    return { total, byStatus: { active, archived } };
  },
};
