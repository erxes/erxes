import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ISurvey } from '@/survey/@types/survey';
import { SURVEY_STATUSES } from '@/survey/db/definitions/surveys';

const REVIEW_OUTCOMES: string[] = [
  SURVEY_STATUSES.ACTIVE,
  SURVEY_STATUSES.REJECTED,
];

const buildReviewNotification = (
  survey: ISurvey,
): { title: string; message: string; type: 'success' | 'warning' } => {
  if (survey.status === SURVEY_STATUSES.REJECTED) {
    return {
      title: 'Survey request rejected',
      message: survey.rejectionReason || `"${survey.title}" was not approved.`,
      type: 'warning',
    };
  }

  return {
    title: 'Survey request approved',
    message: `"${survey.title}" is live and can now be answered.`,
    type: 'success',
  };
};

export const notifySurveyReviewed = async (
  subdomain: string,
  surveys: ISurvey[],
) => {
  for (const survey of surveys) {
    if (!survey.createdCpUserId || !REVIEW_OUTCOMES.includes(survey.status)) {
      continue;
    }

    const cpUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input: { id: survey.createdCpUserId },
      defaultValue: null,
    });

    if (!cpUser?.clientPortalId) {
      continue;
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'cpNotifications',
      action: 'create',
      input: {
        cpUserIds: [cpUser._id],
        clientPortalId: cpUser.clientPortalId,
        eventType: 'surveyReviewed',
        data: {
          ...buildReviewNotification(survey),
          contentType: 'frontline:survey',
          contentTypeId: survey._id,
          kind: 'system',
          allowMultiple: true,
        },
      },
      defaultValue: null,
    });
  }
};
