import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { ApprovalContentMeta } from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

type ResolveApprovalContentInput = {
  models: IModels;
  contentType: string;
  contentId: string;
};

type AutomationApprovalContent = {
  _id: string;
  name?: string;
  createdBy?: string;
};

type AiAgentApprovalContent = {
  _id: string;
  name?: string;
};

export const resolveApprovalContent = async ({
  models,
  contentType,
  contentId,
}: ResolveApprovalContentInput): Promise<ApprovalContentMeta> => {
  if (contentType === AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION) {
    const automation = await models.Automations.findOne(
      { _id: contentId },
      { _id: 1, name: 1, createdBy: 1 },
    ).lean<AutomationApprovalContent | null>();

    if (!automation) {
      throw new ExpectedError('Approval content not found', 'NOT_FOUND');
    }

    return {
      contentType,
      contentId,
      label: automation?.name || 'Automation',
      link: `/automations/edit/${contentId}`,
      ownerId: automation?.createdBy,
    };
  }

  if (contentType === AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT) {
    const aiAgent = await models.AiAgents.findOne(
      { _id: contentId },
      { _id: 1, name: 1 },
    ).lean<AiAgentApprovalContent | null>();

    if (!aiAgent) {
      throw new ExpectedError('Approval content not found', 'NOT_FOUND');
    }

    return {
      contentType,
      contentId,
      label: aiAgent?.name || 'AI Agent',
      link: `/settings/automations/agents/${contentId}`,
    };
  }

  return {
    contentType,
    contentId,
    label: contentType,
  };
};
