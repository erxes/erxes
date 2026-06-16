import { updateConfigs } from '@/integrations/whatsapp/helpers';
import { IContext } from '~/connectionResolvers';

export const whatsappMutations = {
  async whatsappUpdateConfigs(
    _root,
    { configsMap }: { configsMap: Record<string, unknown> },
    { subdomain }: IContext,
  ) {
    await updateConfigs(subdomain, configsMap);

    return { status: 'ok' };
  },
};
