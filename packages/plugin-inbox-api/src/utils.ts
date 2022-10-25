import { serviceDiscovery } from './configs';

export const getIntegrationMeta = async () => {
  const serviceNames = await serviceDiscovery.getServices();
  let metas: any = [];

  for (const serviceName of serviceNames) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const inboxIntegrations =
      (service.config.meta || {}).inboxIntegrations || [];

    if (inboxIntegrations && inboxIntegrations.length > 0) {
      metas = metas.concat(inboxIntegrations);
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
    'facebook-messenger': 'Facebook messenger',
    callpro: 'Callpro'
  };

  for (const meta of metas) {
    response[meta.kind] = meta.label;
  }

  return response;
};
