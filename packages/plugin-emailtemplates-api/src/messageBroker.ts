import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('emailtemplates:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.find(data).lean()
    };
  });

  consumeRPCQueue('emailtemplates:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.findOne(data)
    };
  });
};

export default function() {
  return client;
}
