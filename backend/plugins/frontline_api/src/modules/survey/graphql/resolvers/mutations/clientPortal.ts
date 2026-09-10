import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { createConversationAndMessage } from '@/inbox/trpc/inbox';
import { ISurveyCpUser, ISurveySnapshotStep } from '@/survey/@types/survey';
import {
  buildSurveySnapshot,
  getActiveSurvey,
  getCpVoterId,
  getSnapshotSteps,
  isSurveyClosed,
  refreshSurveyTallies,
} from '@/survey/utils';
import { runSurveyTicketAutomation } from '@/survey/ticketAutomation';
import { IContext, IModels } from '~/connectionResolvers';

const VOTER_REQUIRED_ERROR = 'Sign in to the client portal to vote';

const isDuplicateVote = (error: unknown) =>
  (error as { code?: number })?.code === 11000;

const resolveChannelIntegration = async (
  models: IModels,
  channelId?: string,
  brandId?: string,
) => {
  if (!channelId) {
    throw new Error('This survey is not attached to a channel');
  }

  const integration = await models.Integrations.findOne({
    channelId,
    kind: 'messenger',
    isActive: { $ne: false },
    ...(brandId ? { brandId } : {}),
  }).lean();

  if (!integration) {
    throw new Error(
      brandId
        ? "The survey's brand has no active messenger integration in this channel"
        : 'The survey channel has no erxes messenger integration to file the answer under',
    );
  }

  return integration;
};

const findCustomer = async (subdomain: string, customerId: string) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { query: { _id: customerId } },
    defaultValue: null,
  });

const resolveCpUserCustomer = async (
  subdomain: string,
  integrationId: string,
  cpUser: ISurveyCpUser,
) => {
  if (cpUser.erxesCustomerId) {
    const existing = await findCustomer(subdomain, cpUser.erxesCustomerId);

    if (existing) {
      return existing;
    }
  }

  const matched = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'getWidgetCustomer',
    input: {
      integrationId,
      email: cpUser.email,
      phone: cpUser.phone,
    },
    defaultValue: null,
  });

  if (matched) {
    return matched;
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createMessengerCustomer',
    input: {
      doc: {
        integrationId,
        email: cpUser.email,
        phone: cpUser.phone,
        firstName: cpUser.firstName,
        lastName: cpUser.lastName,
      },
    },
    defaultValue: null,
  });
};

const assertSelection = (selected: string[], steps: ISurveySnapshotStep[]) => {
  if (selected.length === 0) {
    throw new Error('Select at least one option');
  }

  const known = new Set(
    steps.flatMap((step) => step.answers.map((answer) => answer.id)),
  );

  if (selected.some((optionId) => !known.has(optionId))) {
    throw new Error('Unknown survey option');
  }

  const isMultiStep = steps.length > 1;

  for (const step of steps) {
    const stepAnswerIds = new Set(step.answers.map((answer) => answer.id));
    const chosen = selected.filter((optionId) => stepAnswerIds.has(optionId));

    if (!step.allowMultiselect && chosen.length > 1) {
      throw new Error(
        isMultiStep
          ? `Only one answer is allowed for "${step.question}"`
          : 'This survey allows only one answer',
      );
    }
  }
};

export const cpSurveyMutations = {
  async cpSurveySubmit(
    _root: undefined,
    { surveyCode, optionIds }: { surveyCode: string; optionIds: string[] },
    { models, subdomain, cpUser }: IContext,
  ) {
    const survey = await getActiveSurvey(models, surveyCode);

    if (!survey) {
      throw new Error('Survey not found');
    }

    const snapshot = buildSurveySnapshot(survey);

    if (isSurveyClosed(snapshot)) {
      throw new Error('This survey is closed');
    }

    const selected = [...new Set(optionIds)];

    assertSelection(selected, getSnapshotSteps(snapshot));

    const cpUserId = cpUser?._id;
    const voterId = getCpVoterId(cpUser);

    if (!cpUserId || !voterId) {
      throw new Error(VOTER_REQUIRED_ERROR);
    }

    const integration = await resolveChannelIntegration(
      models,
      survey.channelId,
      survey.brandId,
    );

    const existingVote = await models.SurveyVotes.findOne({
      surveyId: survey._id,
      cpUserId,
    }).lean();

    if (existingVote) {
      return {
        status: 'alreadyVoted',
        customerId: existingVote.customerId,
        conversationId: existingVote.conversationId,
      };
    }

    const customer = await resolveCpUserCustomer(
      subdomain,
      integration._id,
      cpUser as ISurveyCpUser,
    );

    if (!customer) {
      throw new Error('Failed to identify the survey respondent');
    }

    const { conversation, message } = await createConversationAndMessage(
      models,
      {
        customerId: customer._id,
        integrationId: integration._id,
        content: survey.question,
        status: 'new',
        extraData: { survey: snapshot },
      },
    );

    await models.Conversations.updateConversation(conversation._id, {
      hasSurvey: true,
    });

    try {
      await models.SurveyVotes.castVote({
        surveyId: survey._id,
        messageId: message._id,
        conversationId: conversation._id,
        voterId,
        cpUserId,
        customerId: customer._id,
        optionIds: selected,
      });
    } catch (e) {
      if (!isDuplicateVote(e)) {
        throw e;
      }

      await models.ConversationMessages.deleteOne({ _id: message._id });
      await models.Conversations.deleteOne({ _id: conversation._id });

      const winner = await models.SurveyVotes.findOne({
        surveyId: survey._id,
        cpUserId,
      }).lean();

      return {
        status: 'alreadyVoted',
        customerId: winner?.customerId,
        conversationId: winner?.conversationId,
      };
    }

    await models.Surveys.increaseSentCount(survey._id);

    await refreshSurveyTallies(models, subdomain, message._id);

    await runSurveyTicketAutomation(models, subdomain, survey._id, selected);

    return {
      status: 'ok',
      customerId: customer._id,
      conversationId: conversation._id,
    };
  },
};

markResolvers(cpSurveyMutations, {
  wrapperConfig: {
    forClientPortal: true,
    cpUserRequired: true,
  },
});
