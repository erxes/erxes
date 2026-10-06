import { IContext } from '~/connectionResolvers';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { isAwaitingForwardVerification } from '@/integrations/mail/utils/forwardVerification';

export const MailPipelineIntegration = {
  awaitingForwardVerification(integration: IMailIntegrationDocument) {
    return isAwaitingForwardVerification(integration);
  },

  async statusId(
    { statusId, pipelineId }: IMailIntegrationDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!statusId || !pipelineId) {
      return '';
    }

    const status = await models.Status.exists({ _id: statusId, pipelineId });

    return status ? statusId : '';
  },
};
