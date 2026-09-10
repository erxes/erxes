import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  ISurveyDocument,
  ISurveyOption,
  ISurveyStep,
} from '@/survey/@types/survey';
import { ITicket } from '@/ticket/@types/ticket';
import { SURVEY_STATUSES } from '@/survey/db/definitions/surveys';
import { getSurveySteps } from '@/survey/utils';
import { IModels } from '~/connectionResolvers';

const STALE_CLAIM_MS = 5 * 60 * 1000;

type SurveyOptionMatch = { step: ISurveyStep; option: ISurveyOption };

const findArmedOptions = (
  survey: ISurveyDocument,
  optionIds: string[],
): SurveyOptionMatch[] => {
  const selected = new Set(optionIds);

  return getSurveySteps(survey).flatMap((step) =>
    step.options
      .filter(
        (option) =>
          selected.has(option._id) &&
          option.ticketCreationEnabled &&
          option.ticketCreationThreshold &&
          option.ticketStatusId &&
          !option.ticketCreated,
      )
      .map((option) => ({ step, option })),
  );
};

const claimOption = async (
  models: IModels,
  surveyId: string,
  optionId: string,
) => {
  const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);

  const claimed = await models.Surveys.updateOne(
    { _id: surveyId },
    { $set: { 'steps.$[step].options.$[option].ticketClaimedAt': new Date() } },
    {
      arrayFilters: [
        { 'step.options._id': optionId },
        {
          'option._id': optionId,
          'option.ticketCreated': { $ne: true },
          'option.ticketClaimedAt': { $not: { $gte: staleBefore } },
        },
      ],
    },
  );

  return claimed.modifiedCount > 0;
};

const releaseOption = (models: IModels, surveyId: string, optionId: string) =>
  models.Surveys.updateOne(
    { _id: surveyId },
    { $unset: { 'steps.$[step].options.$[option].ticketClaimedAt': '' } },
    {
      arrayFilters: [
        { 'step.options._id': optionId },
        { 'option._id': optionId },
      ],
    },
  );

const markOptionCreated = (
  models: IModels,
  surveyId: string,
  optionId: string,
  ticketId: string,
) =>
  models.Surveys.updateOne(
    { _id: surveyId },
    {
      $set: {
        'steps.$[step].options.$[option].ticketCreated': true,
        'steps.$[step].options.$[option].ticketId': ticketId,
      },
    },
    {
      arrayFilters: [
        { 'step.options._id': optionId },
        { 'option._id': optionId },
      ],
    },
  );

const MAX_TICKET_NAME_TITLE = 80;

const buildTicketName = (survey: ISurveyDocument, option: ISurveyOption) => {
  const title = (survey.title || '').trim();
  const shortened =
    title.length > MAX_TICKET_NAME_TITLE
      ? `${title.slice(0, MAX_TICKET_NAME_TITLE).trimEnd()}…`
      : title;

  return `${shortened} — ${option.text}`;
};

const buildTicketDoc = (
  survey: ISurveyDocument,
  step: ISurveyStep,
  option: ISurveyOption,
  voteCount: number,
): ITicket => {
  const threshold = option.ticketCreationThreshold as number;

  return {
    name: buildTicketName(survey, option),
    channelId: survey.channelId || '',
    statusId: option.ticketStatusId,
    pipelineId: '',
    stageId: '',
    description: [
      `Survey: ${survey.title}`,
      `Question: ${step.question}`,
      `Option: ${option.text}`,
      `Votes: ${voteCount} (threshold ${threshold})`,
    ].join('\n'),
    sourceSurvey: {
      surveyId: survey._id,
      surveyStepId: step._id,
      surveyOptionId: option._id,
      question: step.question,
      optionText: option.text,
      voteCount,
      threshold,
    },
  };
};

export const runSurveyTicketAutomation = async (
  models: IModels,
  subdomain: string,
  surveyId: string,
  optionIds: string[],
) => {
  if (!optionIds.length) {
    return;
  }

  const survey = await models.Surveys.findOne({ _id: surveyId });

  if (!survey || survey.status !== SURVEY_STATUSES.ACTIVE) {
    return;
  }

  for (const { step, option } of findArmedOptions(survey, optionIds)) {
    const voteCount = await models.SurveyVotes.countDocuments({
      surveyId,
      optionIds: option._id,
    });

    if (voteCount < (option.ticketCreationThreshold as number)) {
      continue;
    }

    if (!(await claimOption(models, surveyId, option._id))) {
      continue;
    }

    try {
      const ticket = await models.Ticket.addTicket(
        buildTicketDoc(survey, step, option, voteCount),
        survey.createdUserId || `survey:${survey._id}`,
        subdomain,
      );

      await markOptionCreated(models, surveyId, option._id, ticket._id);

      graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
        ticketChanged: { type: 'create', ticket },
      });
      graphqlPubsub.publish('ticketListChanged', {
        ticketListChanged: { type: 'create', ticket },
      });
    } catch (e) {
      await releaseOption(models, surveyId, option._id);
      console.error(
        `Survey ${surveyId} option ${option._id} ticket automation failed: ${
          (e as Error).message
        }`,
      );
    }
  }
};
