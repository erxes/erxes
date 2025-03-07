import { IIntegrationDocument } from '../../models/definitions/integrations';
import { sendCommonMessage, sendCoreMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { isServiceRunning } from '../../utils';

export default {
  async callData(widget, _args, { models, subdomain }: IContext) {
    if (widget?.brand?._id) {
      const serviceRunning = await isServiceRunning('cloudflarecalls');
      if (serviceRunning) {
        const brand = await sendCoreMessage({
          subdomain,
          action: 'brands.findOne',
          data: {
            query: {
              _id: widget.brand._id,
            },
          },
          isRPC: true,
          defaultValue: {},
        });

        if (!brand) {
          throw new Error('Invalid configuration');
        }

        // find integration
        const integration = await models.Integrations.findOne({
          brandId: brand._id,
          kind: 'messenger',
        });

        if (!integration) {
          throw new Error('Integration not found');
        }
        try {
          const inboxId: string = integration._id;

          const integrationDetails = await sendCommonMessage({
            serviceName: 'cloudflarecalls',
            subdomain,
            action: 'api_to_integrations',
            data: { inboxId, integrationId: inboxId, action: 'getDetails' },
            isRPC: true,
            defaultValue: null,
          });

          const isReceiveWebCall =
            integrationDetails.status === 'active' ? true : false;

          return (
            {
              departments: integrationDetails.departments,
              isReceiveWebCall,
            } || {}
          );
        } catch (e) {
          console.error('error', e);

          return null;
        }
      }
      return null;
    }
    return null;
  },
};
