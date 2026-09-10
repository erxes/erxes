import { ISurveyInput } from '@/survey/db/models/Surveys';
import { buildSurveySnapshot } from '@/survey/utils';
import { SURVEY_STATUSES } from '@/survey/db/definitions/surveys';
import { publishMessage } from '@/inbox/graphql/resolvers/mutations/conversations';
import { IContext } from '~/connectionResolvers';

export const surveyMutations = {
  async surveyAdd(
    _root: undefined,
    doc: ISurveyInput,
    { models, user }: IContext,
  ) {
    return models.Surveys.createSurvey(doc, user._id);
  },

  async surveyEdit(
    _root: undefined,
    { _id, ...doc }: ISurveyInput & { _id: string },
    { models }: IContext,
  ) {
    return models.Surveys.updateSurvey(_id, doc);
  },

  async surveyRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Surveys.removeSurveys(_ids);
  },

  async surveyToggleStatus(
    _root: undefined,
    { _ids, status }: { _ids: string[]; status: string },
    { models }: IContext,
  ) {
    return models.Surveys.changeStatus(_ids, status);
  },

  async surveySendToConversation(
    _root: undefined,
    { _id, conversationId }: { _id: string; conversationId: string },
    { models, user }: IContext,
  ) {
    const survey = await models.Surveys.getSurvey(_id);

    if (survey.status !== SURVEY_STATUSES.ACTIVE) {
      throw new Error('Only an active survey can be sent');
    }

    const conversation =
      await models.Conversations.getConversation(conversationId);

    const integration = await models.Integrations.getIntegration({
      _id: conversation.integrationId,
    });

    if (integration.kind !== 'messenger') {
      throw new Error('Surveys can only be sent to messenger conversations');
    }

    if (survey.channelId && survey.channelId !== integration.channelId) {
      throw new Error('This survey belongs to another channel');
    }

    if (survey.brandId && survey.brandId !== integration.brandId) {
      throw new Error('This survey belongs to another brand');
    }

    const message = await models.ConversationMessages.addMessage(
      {
        conversationId,
        content: survey.question,
        internal: false,
        extraData: { survey: buildSurveySnapshot(survey) },
      },
      user._id,
    );

    const dbMessage = await models.ConversationMessages.getMessage(message._id);

    await models.Conversations.updateConversation(conversationId, {
      hasSurvey: true,
    });

    await models.Surveys.increaseSentCount(survey._id);

    await publishMessage(models, dbMessage, conversation.customerId);

    return dbMessage;
  },
};
