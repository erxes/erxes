import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { isAwaitingForwardVerification } from '@/integrations/mail/utils/forwardVerification';

export const MailPipelineIntegration = {
  awaitingForwardVerification(integration: IMailIntegrationDocument) {
    return isAwaitingForwardVerification(integration);
  },
};
