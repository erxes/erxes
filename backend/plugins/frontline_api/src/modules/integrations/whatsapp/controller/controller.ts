import { getConfig } from '@/integrations/whatsapp/commonUtils';
import { receiveMessage } from '@/integrations/whatsapp/controller/receiveMessage';
import { IWhatsappMessageValue } from '@/integrations/whatsapp/@types/utils';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const getQueryValue = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const whatsappGetStatus = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const integrationId = getQueryValue(req.query.integrationId);

    const integration = await models.WhatsappIntegrations.findOne({
      erxesApiId: integrationId,
    });

    return res.send({
      status: integration?.healthStatus || 'healthy',
      error: integration?.error,
    });
  } catch (e) {
    next(e);
  }
};

export const whatsappSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const verifyToken = getQueryValue(req.query['hub.verify_token']);
    const configuredVerifyToken = await getConfig(
      models,
      'WHATSAPP_VERIFY_TOKEN',
    );

    const integration = await models.WhatsappIntegrations.findOne({
      verifyToken,
    });

    if (
      req.query['hub.mode'] === 'subscribe' &&
      (verifyToken === configuredVerifyToken || integration)
    ) {
      return res.send(req.query['hub.challenge']);
    }

    return res.send('OK');
  } catch (e) {
    next(e);
  }
};

export const whatsappWebhook = async (req, res, next) => {
  try {
    const subdomain = isDev ? 'localhost' : getSubdomain(req);
    const models = await generateModels(subdomain);
    const data = req.body;

    if (data?.object !== 'whatsapp_business_account') {
      return res.send('OK');
    }

    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value as IWhatsappMessageValue;
        const phoneNumberId = value.metadata?.phone_number_id;

        if (!phoneNumberId || !value.messages?.length) {
          continue;
        }

        const integration = await models.WhatsappIntegrations.findOne({
          phoneNumberId,
        });

        if (!integration) {
          continue;
        }

        for (const message of value.messages) {
          const contact = value.contacts?.find(
            ({ wa_id }) => wa_id === message.from,
          );

          await receiveMessage(
            models,
            subdomain,
            integration,
            message,
            contact?.profile?.name,
          );
        }
      }
    }

    return res.send('success');
  } catch (e) {
    next(e);
  }
};
