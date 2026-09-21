import { ISurveyDocument } from '@/survey/@types/survey';
import { getSurveySteps } from '@/survey/utils';
import { IContext } from '~/connectionResolvers';

export const Survey = {
  async createdUser(survey: ISurveyDocument) {
    if (!survey.createdUserId) {
      return null;
    }

    return { __typename: 'User', _id: survey.createdUserId };
  },

  async channel(survey: ISurveyDocument, _params, { models }: IContext) {
    if (!survey.channelId) {
      return null;
    }

    return models.Channels.findOne({ _id: survey.channelId });
  },

  steps(survey: ISurveyDocument) {
    return getSurveySteps(survey);
  },

  async results(survey: ISurveyDocument, _params, { models }: IContext) {
    const [answerCounts, voterCount] = await Promise.all([
      models.SurveyVotes.countByOption({ surveyId: survey._id }),
      models.SurveyVotes.countVoters({ surveyId: survey._id }),
    ]);

    const countById = new Map(answerCounts.map((row) => [row.id, row.count]));

    const steps = getSurveySteps(survey).map((step) => {
      const counted = step.options.map((option) => ({
        _id: option._id,
        text: option.text,
        count: countById.get(option._id) || 0,
      }));

      const stepVotes = counted.reduce((sum, option) => sum + option.count, 0);

      return {
        _id: step._id,
        name: step.name,
        question: step.question,
        totalVotes: stepVotes,
        options: counted.map((option) => ({
          ...option,
          percent: stepVotes ? Math.round((option.count / stepVotes) * 100) : 0,
        })),
      };
    });

    return {
      totalVotes: steps.reduce((sum, step) => sum + step.totalVotes, 0),
      voterCount,
      options: steps.flatMap((step) => step.options),
      steps,
    };
  },
};
