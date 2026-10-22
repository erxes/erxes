import type { IContext } from '~/connectionResolvers';
import { IWhatsappConnectionView } from '@/integrations/whatsapp/@types/integrations';
import {
  WHATSAPP_CONFIG_CODES,
  WHATSAPP_GRAPH_VERSION,
} from '@/integrations/whatsapp/constants';
import {
  getWhatsappConfig,
  getWhatsappWebhookUrl,
  isSaas,
  resolveWhatsappApp,
} from '@/integrations/whatsapp/config';

export interface IWhatsappConfigView {
  appId: string;
  configId: string;
  verifyToken: string;
  hasAppSecret: boolean;
  webhookUrl: string;
}

/** Settings view without the app secret; SaaS shares one verify token, so it stays hidden. */
export const getWhatsappConfigView = async (
  models: IContext['models'],
  subdomain: string,
): Promise<IWhatsappConfigView> => {
  const app = await resolveWhatsappApp(models);

  return {
    appId: app.appId,
    configId: app.configId,
    verifyToken: isSaas() ? '' : app.verifyToken,
    hasAppSecret: Boolean(app.appSecret),
    webhookUrl: getWhatsappWebhookUrl(subdomain),
  };
};

export const whatsappQueries = {
  async whatsappConfig(
    _root: undefined,
    _args: Record<string, never>,
    { models, subdomain, checkPermission }: IContext,
  ): Promise<IWhatsappConfigView> {
    await checkPermission('integrationsEdit');

    return getWhatsappConfigView(models, subdomain);
  },

  async whatsappEmbeddedSignupConfig(
    _root: undefined,
    _args: Record<string, never>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsAdd');

    const [appId, configId, appSecret] = await Promise.all([
      getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.APP_ID),
      getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.CONFIG_ID),
      getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.APP_SECRET),
    ]);

    return {
      appId,
      configId,
      graphVersion: WHATSAPP_GRAPH_VERSION,
      isConfigured: Boolean(appId && configId && appSecret),
    };
  },

  async whatsappConnection(
    _root: undefined,
    { integrationId }: { integrationId: string },
    { models, checkPermission }: IContext,
  ): Promise<IWhatsappConnectionView | null> {
    await checkPermission('showIntegrations');

    const connection = await models.WhatsappIntegrations.findOne({
      erxesApiId: integrationId,
    });

    return connection ? models.WhatsappIntegrations.toView(connection) : null;
  },
};
