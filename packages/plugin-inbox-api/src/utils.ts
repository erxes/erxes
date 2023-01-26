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
    lead: 'Popups & forms',
    webhook: 'Webhook',
    booking: 'Booking',
    callpro: 'Callpro'
  };

  for (const meta of metas) {
    response[meta.kind] = meta.label;
  }

  return response;
};

export const isServiceRunning = async (
  integrationKind: string
): Promise<boolean> => {
  const serviceNames = await serviceDiscovery.getServices();

  // some kinds are separated by -
  return (
    integrationKind && serviceNames.includes(integrationKind.split('-')[0])
  );
};
