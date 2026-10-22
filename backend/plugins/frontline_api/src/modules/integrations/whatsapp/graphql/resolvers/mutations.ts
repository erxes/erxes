import { z } from 'zod';
import { getEnv } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { IWhatsappConnectionView } from '@/integrations/whatsapp/@types/integrations';
import { WHATSAPP_CONFIG_CODES } from '@/integrations/whatsapp/constants';
import {
  IWhatsappConfigView,
  getWhatsappConfigView,
} from '@/integrations/whatsapp/graphql/resolvers/queries';
import {
  WhatsappSignupFinishInput,
  finishWhatsappEmbeddedSignup,
} from '@/integrations/whatsapp/signup';

const configInputSchema = z.object({
  appId: z.string().trim().regex(/^\d+$/, 'The App ID must be numeric'),
  appSecret: z.string().trim().optional(),
  configId: z
    .string()
    .trim()
    .regex(/^\d+$/, 'The Configuration ID must be numeric'),
  verifyToken: z.string().trim().optional(),
});

export const whatsappMutations = {
  async whatsappUpdateConfig(
    _root: undefined,
    args: z.input<typeof configInputSchema>,
    { models, subdomain, checkPermission }: IContext,
  ): Promise<IWhatsappConfigView> {
    await checkPermission('integrationsEdit');

    if (getEnv({ name: 'VERSION' }) === 'saas') {
      throw new Error('WhatsApp app settings are managed by erxes on SaaS');
    }

    const parsed = configInputSchema.safeParse(args);

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || 'Invalid settings');
    }

    const { appId, appSecret, configId, verifyToken } = parsed.data;

    await models.WhatsappConfigs.updateConfigs({
      [WHATSAPP_CONFIG_CODES.APP_ID]: appId,
      [WHATSAPP_CONFIG_CODES.CONFIG_ID]: configId,
      ...(appSecret ? { [WHATSAPP_CONFIG_CODES.APP_SECRET]: appSecret } : {}),
      ...(verifyToken
        ? { [WHATSAPP_CONFIG_CODES.VERIFY_TOKEN]: verifyToken }
        : {}),
    });

    return getWhatsappConfigView(models, subdomain);
  },

  async whatsappEmbeddedSignupFinish(
    _root: undefined,
    input: WhatsappSignupFinishInput,
    { models, subdomain, user, checkPermission }: IContext,
  ): Promise<IWhatsappConnectionView> {
    await checkPermission('integrationsAdd');

    return finishWhatsappEmbeddedSignup({
      models,
      subdomain,
      userId: user._id,
      input,
    });
  },

  async whatsappDiscardConnection(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ): Promise<boolean> {
    await checkPermission('integrationsAdd');

    // Only the user's own connection that never reached an inbox.
    const removed = await models.WhatsappIntegrations.deleteOne({
      _id,
      connectedBy: user._id,
      erxesApiId: { $exists: false },
    });

    return removed.deletedCount > 0;
  },
};
