import { serviceDiscovery } from './configs';

export const getIntegrationMeta = async () => {
  const serviceNames = await serviceDiscovery.getServices();
  const metas: any = [];

  for (const serviceName of serviceNames) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const inboxIntegration = (service.config.meta || {}).inboxIntegration;

    if (inboxIntegration) {
      metas.push(inboxIntegration);
    }
  }

  return metas;
};

export const getIntegrationsKinds = async () => {
  const metas = await getIntegrationMeta();

  const response = {
    messenger: 'Messenger',
    lead: 'Lead',
    webhook: 'Webhook',
    booking: 'Booking',
    'facebook-post': 'Facebook post',
    'facebook-messenger': 'Facebook messenger'
  };

  for (const meta of metas) {
    response[meta.kind] = meta.label;
  }

  return response;
};
