import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';

import { generateModels } from './connectionResolver';

export const initBroker = async () => {
  consumeQueue('riskassessment:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue(
    'riskassessment:riskAssessments.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.RiskAssessments.find(data),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'riskassessment:riskAssessments.create',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.RiskAssessments.addRiskAssessment(data),
        status: 'success',
      };
    },
  );
};

export const sendFormsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};

export const sendCardsMessage = (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};
export const sendCoreMessage = (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
export const sendTagsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};

export const sendRiskAssessmentMessage = (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'riskassessment',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
