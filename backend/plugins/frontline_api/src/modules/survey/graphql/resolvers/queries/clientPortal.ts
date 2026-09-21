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
      const regex = new RegExp(escapeRegExp(searchValue), 'i');
      query.$or = [
        { title: regex },
        { question: regex },
        { 'steps.question': regex },
      ];
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
    { conversationId }: { conversationId: string },
    { models, cpUser }: IContext,
  ) {
    const voterId = getCpVoterId(cpUser);

    if (!voterId) {
      return [];
    }

    const votes = await models.SurveyVotes.find({
      conversationId,
      voterId,
    }).lean();

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
