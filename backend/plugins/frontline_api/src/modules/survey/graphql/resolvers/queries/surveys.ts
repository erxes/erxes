import {
  ICursorPaginateParams,
  IUserDocument,
  Resolver,
} from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { ISurveyDocument } from '@/survey/@types/survey';
import { IContext, IModels } from '~/connectionResolvers';

type SurveyFilterArgs = {
  searchValue?: string;
  status?: string;
  channelId?: string;
};

type SurveyListArgs = SurveyFilterArgs & ICursorPaginateParams;

const generateFilterQuery = async (
  { searchValue, status, channelId }: SurveyFilterArgs,
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
    conditions.push({
      $or: [{ title: regex }, { question: regex }, { 'steps.question': regex }],
    });
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

export const surveyQueries: Record<string, Resolver> = {
  async surveyList(_root, args: SurveyListArgs, context) {
    const { models, user } = context as IContext;

    return cursorPaginate<ISurveyDocument>({
      model: models.Surveys,
      params: { ...args, orderBy: args.orderBy || { createdAt: -1 } },
      query: await generateFilterQuery(args, models, user),
    });
  },

  async surveyDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Surveys.getSurvey(_id);
  },

  async surveyTotalCount(_root, args: SurveyFilterArgs, context) {
    const { models, user } = context as IContext;
    const query = await generateFilterQuery(args, models, user);

    const [total, active, archived] = await Promise.all([
      models.Surveys.countDocuments(query),
      models.Surveys.countDocuments({ ...query, status: 'active' }),
      models.Surveys.countDocuments({ ...query, status: 'archived' }),
    ]);

    return { total, byStatus: { active, archived } };
  },
};
