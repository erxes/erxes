import {
  actionCreateComment,
  checkCommentTrigger,
} from '@/integrations/instagram/meta/automation/comments';
import {
  actionCreateMessage,
  checkMessageTrigger,
} from '@/integrations/instagram/meta/automation/messages';
import { ICheckTriggerData } from '@/integrations/instagram/meta/automation/types/automationTypes';
import {
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';

export const instagramAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain },
  ) => {
    switch (collectionType) {
      case 'messages':
        return await actionCreateMessage({
          models,
          subdomain,
          action,
          execution,
        });
      case 'comments':
        return await actionCreateComment(models, subdomain, action, execution);

      default:
        return { result: null };
    }
  },
  checkCustomTrigger: async (data: ICheckTriggerData, { subdomain }) => {
    const { collectionType } = data;
    switch (collectionType) {
      case 'messages':
        return await checkMessageTrigger(subdomain, data);

      case 'comments':
        return await checkCommentTrigger(subdomain, data);

      default:
        return false;
    }
  },
};
