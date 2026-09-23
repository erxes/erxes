import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  escapeRegExp,
  markResolvers,
} from 'erxes-api-shared/utils';
import { ISurveyDocument } from '@/survey/@types/survey';
import { SURVEY_STATUSES } from '@/survey/db/definitions/surveys';
import {
  buildSurveySnapshot,
  getActiveSurvey,
  getCpVoterId,
  isSurveyClosed,
  toCpSurvey,
} from '@/survey/utils';
import { IContext } from '~/connectionResolvers';

type CpSurveysArgs = {
  searchValue?: string;
  channelId?: string;
  brandId?: string;
} & ICursorPaginateParams;

type CpSurveyRequestsArgs = {
  searchValue?: string;
  channelId?: string;
  status?: string;
} & ICursorPaginateParams;

const REQUESTER_REQUIRED_ERROR =
  'Sign in to the client portal to see your survey requests';

const buildSearchQuery = (searchValue: string) => {
  const regex = new RegExp(escapeRegExp(searchValue), 'i');

  return [{ title: regex }, { question: regex }, { 'steps.question': regex }];
};

export const cpSurveyQueries = {
  async cpSurveys(
    _root: undefined,
    args: CpSurveysArgs,
    { models, cpUser }: IContext,
  ) {
    const { searchValue, channelId, brandId, ...paginate } = args;

    const query: Record<string, unknown> = { status: SURVEY_STATUSES.ACTIVE };

    if (channelId) {
      query.channelId = channelId;
    }

    if (brandId) {
      query.brandId = brandId;
    }

    if (searchValue) {
      query.$or = buildSearchQuery(searchValue);
    }

    const { list, pageInfo, totalCount } =
      await cursorPaginate<ISurveyDocument>({
        model: models.Surveys,
        params: { ...paginate, orderBy: paginate.orderBy || { createdAt: -1 } },
        query,
      });

    const voterId = getCpVoterId(cpUser);

    const votes = voterId
      ? await models.SurveyVotes.find({
          surveyId: { $in: list.map((survey) => survey._id) },
          voterId,
        }).lean()
      : [];

    const selectionsBySurvey = new Map<string, string[]>();

    for (const vote of votes) {
      selectionsBySurvey.set(vote.surveyId, [
        ...(selectionsBySurvey.get(vote.surveyId) || []),
        ...vote.optionIds,
      ]);
    }

    return {
      pageInfo,
      totalCount,
      list: list.map((survey) => ({
        survey: toCpSurvey(survey),
        votedOptionIds: selectionsBySurvey.get(survey._id) || [],
      })),
    };
  },

  async cpSurveyRequests(
    _root: undefined,
    args: CpSurveyRequestsArgs,
    { models, cpUser }: IContext,
  ) {
    const cpUserId = cpUser?._id;

    if (!cpUserId) {
      throw new Error(REQUESTER_REQUIRED_ERROR);
    }

    const { searchValue, channelId, status, ...paginate } = args;

    const query: Record<string, unknown> = { createdCpUserId: cpUserId };

    if (channelId) {
      query.channelId = channelId;
    }

    if (status) {
      if (!SURVEY_STATUSES.ALL.includes(status)) {
        throw new Error(`Unknown survey status: ${status}`);
      }

      query.status = status;
    }

    if (searchValue) {
      query.$or = buildSearchQuery(searchValue);
    }

    const { list, pageInfo, totalCount } =
      await cursorPaginate<ISurveyDocument>({
        model: models.Surveys,
        params: { ...paginate, orderBy: paginate.orderBy || { createdAt: -1 } },
        query,
      });

    return { pageInfo, totalCount, list: list.map(toCpSurvey) };
  },

  async cpSurveyDetail(
    _root: undefined,
    { channelId, surveyCode }: { channelId: string; surveyCode: string },
    { models, cpUser }: IContext,
  ) {
    const channel = await models.Channels.findOne({ _id: channelId }).lean();
    const survey = await getActiveSurvey(models, surveyCode);

    if (!channel || !survey || survey.channelId !== channelId) {
      throw new Error('Invalid configuration');
    }

    if (isSurveyClosed(buildSurveySnapshot(survey))) {
      return { survey: null, votedOptionIds: [] };
    }

    const voterId = getCpVoterId(cpUser);

    if (!voterId) {
      return { survey: toCpSurvey(survey), votedOptionIds: [] };
    }

    const vote = await models.SurveyVotes.findOne({
      surveyId: survey._id,
      voterId,
    }).lean();

    return {
      survey: toCpSurvey(survey),
      votedOptionIds: vote?.optionIds || [],
    };
  },

  async cpSurveyVotes(
    _root: undefined,
    {
      conversationId,
      customerId,
    }: { conversationId?: string; customerId?: string },
    { models, cpUser }: IContext,
  ) {
    if (!conversationId && !customerId) {
      throw new Error('conversationId or customerId is required');
    }

    const query: Record<string, string> = {};

    if (conversationId) {
      query.conversationId = conversationId;
    }

    if (customerId) {
      query.customerId = customerId;
    } else {
      const voterId = getCpVoterId(cpUser);

      if (!voterId) {
        return [];
      }

      query.voterId = voterId;
    }

    const votes = await models.SurveyVotes.find(query).lean();

    return votes.map((vote) => ({
      messageId: vote.messageId,
      optionIds: vote.optionIds,
    }));
  },
};

markResolvers(cpSurveyQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
