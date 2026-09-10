import {
  ISurveyCpUser,
  ISurveyDocument,
  ISurveyOption,
  ISurveySnapshot,
  ISurveySnapshotStep,
  ISurveyStep,
} from '@/survey/@types/survey';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { SURVEY_STATUSES } from '@/survey/db/definitions/surveys';
import { IModels } from '~/connectionResolvers';

export const getActiveSurvey = async (
  models: IModels,
  surveyCode: string,
): Promise<ISurveyDocument | null> =>
  models.Surveys.findOne({
    $or: [{ code: surveyCode }, { _id: surveyCode }],
    status: SURVEY_STATUSES.ACTIVE,
  });

export const getSurveySteps = (survey: ISurveyDocument): ISurveyStep[] => {
  if (survey.steps?.length) {
    return [...survey.steps].sort((a, b) => a.order - b.order);
  }

  return [
    {
      _id: survey._id,
      order: 0,
      question: survey.question,
      options: [...survey.options].sort((a, b) => a.order - b.order),
      allowMultiselect: Boolean(survey.allowMultiselect),
    },
  ];
};

export const toCpSurvey = (survey: ISurveyDocument) => {
  const stripOption = (option: ISurveyOption) => ({
    _id: option._id,
    text: option.text,
    order: option.order,
  });

  const source = survey.toObject ? survey.toObject() : survey;

  return {
    ...source,
    options: (source.options || []).map(stripOption),
    steps: (source.steps || []).map((step) => ({
      ...step,
      options: (step.options || []).map(stripOption),
    })),
  };
};

export const getSnapshotSteps = (
  snapshot: ISurveySnapshot,
): ISurveySnapshotStep[] => {
  if (snapshot.steps?.length) {
    return snapshot.steps;
  }

  return [
    {
      stepId: snapshot.surveyId,
      question: snapshot.question,
      answers: snapshot.answers,
      allowMultiselect: Boolean(snapshot.allowMultiselect),
    },
  ];
};

export const buildSurveySnapshot = (
  survey: ISurveyDocument,
): ISurveySnapshot => {
  const steps: ISurveySnapshotStep[] = getSurveySteps(survey).map((step) => ({
    stepId: step._id,
    name: step.name,
    description: step.description,
    question: step.question,
    answers: step.options.map((option) => ({
      id: option._id,
      text: option.text,
    })),
    allowMultiselect: Boolean(step.allowMultiselect),
  }));

  const [firstStep] = steps;

  return {
    surveyId: survey._id,
    question: firstStep.question,
    answers: firstStep.answers,
    allowMultiselect: firstStep.allowMultiselect,
    steps,
    expiry: survey.durationHours
      ? new Date(Date.now() + survey.durationHours * 3_600_000).toISOString()
      : undefined,
    results: { isFinalized: false, answerCounts: [] },
  };
};

export const getCpVoterId = (
  cpUser: ISurveyCpUser | undefined,
): string | undefined => cpUser?.erxesCustomerId || cpUser?._id;

export const isSurveyClosed = (snapshot: ISurveySnapshot) => {
  if (snapshot.results?.isFinalized) {
    return true;
  }

  if (!snapshot.expiry) {
    return false;
  }

  const expiresAt = new Date(snapshot.expiry).getTime();

  return !Number.isNaN(expiresAt) && expiresAt <= Date.now();
};

export const refreshSurveyTallies = async (
  models: IModels,
  subdomain: string,
  messageId: string,
) => {
  const message = await models.ConversationMessages.findOne({ _id: messageId });

  if (!message) {
    throw new Error('Survey message not found');
  }

  const snapshot = (
    message.extraData as { survey?: ISurveySnapshot } | undefined
  )?.survey;

  if (!snapshot) {
    throw new Error('This message does not carry a survey');
  }

  const answerCounts = await models.SurveyVotes.countByOption({ messageId });
  const countById = new Map(answerCounts.map((row) => [row.id, row.count]));

  const results = {
    isFinalized: isSurveyClosed(snapshot),
    answerCounts: getSnapshotSteps(snapshot)
      .flatMap((step) => step.answers)
      .map((answer) => ({
        id: answer.id,
        count: countById.get(answer.id) || 0,
      })),
  };

  const updated = await models.ConversationMessages.findOneAndUpdate(
    { _id: messageId },
    { $set: { 'extraData.survey.results': results } },
    { new: true },
  );

  if (!updated) {
    throw new Error('Survey message not found');
  }

  if (updated.conversationId) {
    await models.Conversations.updateConversation(updated.conversationId, {
      isCustomerRespondedLast: true,
      readUserIds: [],
    });
  }

  await pConversationClientMessageInserted(
    subdomain,
    JSON.parse(JSON.stringify(updated)),
  );

  return updated;
};
