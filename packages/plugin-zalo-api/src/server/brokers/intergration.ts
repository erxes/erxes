import { generateModels } from '../../models';
import { removeIntegration, zaloCreateIntegration } from '../controllers';

export const integrationBroker = ({ consumeRPCQueue }) => {
  consumeRPCQueue(
    'zalo:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);

      if (kind === 'zalo') {
        return zaloCreateIntegration(models, subdomain, doc);
      }

      return {
        status: 'error',
        data: 'Wrong kind'
      };
    }
  );

  consumeRPCQueue(
    'zalo:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);
      await removeIntegration(models, integrationId);
      return {
        status: 'success'
      };
    }
  );
  consumeRPCQueue(
    'zalo:getStatus',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId
      });

      let result = {
        status: 'healthy'
      } as any;

      if (integration) {
        result = {
          status: 'healthy',
          error: integration?.error
        };
      }

      return {
        data: result,
        status: 'success'
      };
    }
  );
};
