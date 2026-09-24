import { updateConfigs } from '@/integrations/whatsapp/helpers';
import { IContext } from '~/connectionResolvers';

export const whatsappMutations = {
  async whatsappUpdateConfigs(
    _root,
    { configsMap }: { configsMap: Record<string, unknown> },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    const allowed: Record<string, string> = {};

    for (const code of Object.keys(configsMap || {})) {
      if (code !== 'WHATSAPP_VERIFY_TOKEN') {
        throw new Error(
          `Unknown config key "${code}" — only WHATSAPP_VERIFY_TOKEN may be updated`,
        );
      }

      const value = configsMap[code];

      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${code} must be a non-empty string`);
      }

      allowed[code] = value;
    }

    await updateConfigs(subdomain, allowed);

    return { status: 'ok' };
  },
};
