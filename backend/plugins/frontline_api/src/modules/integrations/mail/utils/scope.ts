import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';

export const mailScopeId = (integration: IMailIntegrationDocument) =>
  integration.inboxId || integration._id;

export const isPipelineIntegration = (integration: IMailIntegrationDocument) =>
  Boolean(integration.pipelineId);
