import { IModels } from '~/connectionResolvers';
import {
  buildInboxAddress,
  buildOwnDomainAddress,
  resolveMailTenant,
} from '@/integrations/mail/utils/address';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';
import { platformMailDomain } from '@/integrations/mail/utils/platformConfig';

export const buildMailAddress = async (subdomain: string, name: string) => {
  const connection = await readConnectedCloudflare(subdomain);

  return connection?.zoneName
    ? buildOwnDomainAddress(name, connection.zoneName)
    : buildInboxAddress(
        resolveMailTenant(subdomain),
        name,
        platformMailDomain(subdomain),
      );
};

export const allocateMailAddress = async (
  models: IModels,
  subdomain: string,
  name: string,
) => {
  const address = await buildMailAddress(subdomain, name);

  if (await models.MailIntegrations.exists({ address })) {
    throw new Error(
      `${address} already belongs to another inbox — give this one a different name`,
    );
  }

  return address;
};
