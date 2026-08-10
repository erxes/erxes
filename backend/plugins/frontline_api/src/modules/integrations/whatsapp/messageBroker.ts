import { generateModels } from '~/connectionResolvers';
import { handleWhatsappMessage } from '@/integrations/whatsapp/handleWhatsappMessage';
import {
  whatsappCreateIntegration,
  whatsappRemoveIntegration,
  whatsappRepairIntegration,
  whatsappUpdateIntegration,
} from '@/integrations/whatsapp/helpers';

/**
 * Entry point used by the inbox to dispatch an outgoing message.
 *
 * Mirrors `handleFacebookIntegration`: these are plain in-process functions
 * called directly from the inbox mutations, not queue consumers.
 */
export const handleWhatsappIntegration = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { type } = data;

  let response: {
    status: 'success' | 'error';
    data?: any;
    errorMessage?: string;
  } = {
    status: 'success',
  };

  try {
    if (type === 'whatsapp') {
      response.data = await handleWhatsappMessage(models, subdomain, data);
    }
  } catch (e) {
    response = {
      status: 'error',
      errorMessage: e.message,
    };
  }

  return response;
};

export const whatsappCreateIntegrations = async ({ subdomain, data }) => {
  try {
    return await whatsappCreateIntegration(subdomain, data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to create integration: ${e.message}`,
    };
  }
};

/**
 * `doc` is the envelope `sendUpdateIntegration` builds, not the config itself —
 * the JSON string the update expects is `doc.data`. Passing `doc` straight
 * through reached `parseConfig` as an object and failed every update with
 * `Invalid payload format: "[object Object]" is not valid JSON`, which is how a
 * WhatsApp integration became uneditable once created.
 */
export const whatsappUpdateIntegrations = async ({
  subdomain,
  data: { integrationId, doc },
}): Promise<{ status: string; errorMessage?: string }> => {
  try {
    return await whatsappUpdateIntegration(subdomain, integrationId, doc?.data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to update integration: ${e.message}`,
    };
  }
};

export const whatsappRemoveIntegrations = async ({
  subdomain,
  data: { integrationId },
}) => {
  try {
    return await whatsappRemoveIntegration(subdomain, integrationId);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to remove integration: ${e.message}`,
    };
  }
};

/**
 * Re-checks stored credentials and clears the error state if they work again.
 *
 * An access token expiring is the usual way a WhatsApp integration breaks, so
 * "repair" here means revalidating rather than re-subscribing to anything.
 */
export const whatsappRepairIntegrations = async ({
  subdomain,
  data: { integrationId },
}) => {
  try {
    return await whatsappRepairIntegration(subdomain, integrationId);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to repair integration: ${e.message}`,
    };
  }
};

/**
 * Health for the integration settings screen. A missing integration is
 * reported rather than thrown so the UI can show it as disconnected.
 */
export const whatsappStatus = async ({
  subdomain,
  data: { integrationId },
}: {
  subdomain: string;
  data: { integrationId: string };
}): Promise<{ data: any; status: string }> => {
  const models = await generateModels(subdomain);

  const integration = await models.WhatsappIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (!integration) {
    return { status: 'success', data: { status: 'not-found' } };
  }

  return {
    status: 'success',
    data: {
      status: integration.healthStatus || 'healthy',
      error: integration.error,
    },
  };
};
