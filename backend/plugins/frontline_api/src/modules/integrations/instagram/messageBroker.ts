import { generateModels } from '~/connectionResolvers';
import {
  removeAccount,
  repairIntegrations,
  instagramCreateIntegration,
  removeIntegration,
} from '@/integrations/instagram/helpers';
import { handleInstagramMessage } from '@/integrations/instagram/handleInstagramMessage';

export interface StatusRequest {
  integrationId: string;
}

export interface StatusResponse {
  status: 'healthy' | 'error' | 'not-found';
  error?: string;
}

export async function handleInstagramIntegration({ subdomain, data }) {
  const models = await generateModels(subdomain);
  const { action, type } = data;
  let response: {
    status: 'success' | 'error';
    data?: any;
    errorMessage?: string;
  } = {
    status: 'success',
  };

  try {
    if (type === 'instagram') {
      response.data = await handleInstagramMessage(models, data, subdomain);
    }

    if (action === 'getConfigs') {
      response.data = await models.InstagramConfigs.find({});
    }
  } catch (e) {
    response = {
      status: 'error',
      errorMessage: e.message,
    };
  }

  return response;
}

export async function instagramCreateIntegrations({ subdomain, data }) {
  try {
    return await instagramCreateIntegration(subdomain, data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to create integration: ${e.message}`,
    };
  }
}

export async function instagramUpdateIntegrations({
  subdomain,
  data: { integrationId, doc },
}) {
  try {
    const models = await generateModels(subdomain);
    let details;
    try {
      details = JSON.parse(doc);
    } catch (parseError) {
      return {
        status: 'error',
        errorMessage: `Invalid payload format: ${parseError.message}`,
      };
    }

    const integration = await models.InstagramIntegrations.findOne({
      erxesApiId: integrationId,
    });

    if (!integration) {
      return {
        status: 'error',
        errorMessage: 'Integration not found.',
      };
    }

    await models.InstagramIntegrations.updateOne(
      { erxesApiId: integrationId },
      { $set: details },
    );

    return { status: 'success' };
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to update integration: ${e.message}`,
    };
  }
}

export async function instagramRemoveIntegrations({
  subdomain,
  data: { integrationId },
}) {
  try {
    return await removeIntegration(subdomain, integrationId);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to remove integration: ${e.message}`,
    };
  }
}

export async function instagramRemoveAccount({
  subdomain,
  data: { integrationId },
}) {
  try {
    const result = await removeAccount(subdomain, integrationId);
    return {
      erxesApiId: result,
      status: 'success',
    };
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to remove account: ${e.message}`,
    };
  }
}

export async function instagramRepairIntegrations({
  subdomain,
  data: { integrationId },
}) {
  try {
    return await repairIntegrations(subdomain, integrationId);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to repair integration: ${e.message}`,
    };
  }
}

export async function instagramStatus({
  subdomain,
  data: { integrationId },
}: {
  subdomain: string;
  data: { integrationId: string };
}): Promise<{ data: any; status: string }> {
  try {
    const models = await generateModels(subdomain);

    const integration = await models.InstagramIntegrations.findOne({
      erxesApiId: integrationId,
    });

    let result = { status: 'healthy' } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || 'healthy',
        error: integration.error,
      };
    }

    return { data: result, status: 'success' };
  } catch (error) {
    return {
      data: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      status: 'error',
    };
  }
}
