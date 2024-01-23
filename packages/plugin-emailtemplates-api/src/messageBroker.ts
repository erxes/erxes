import { generateModels } from './connectionResolver';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeRPCQueue('emailtemplates:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.find(data).lean(),
    };
  });

  consumeRPCQueue('emailtemplates:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.findOne(data),
    };
  });
};
