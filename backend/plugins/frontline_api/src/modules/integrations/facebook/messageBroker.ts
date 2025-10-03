import { generateModels } from '~/connectionResolvers';
import {
  removeAccount,
  repairIntegrations,
  facebookCreateIntegration,
  removeIntegration,
} from '@/integrations/facebook/helpers';
import { handleFacebookMessage } from '@/integrations/facebook/handleFacebookMessage';
export interface StatusRequest {
  integrationId: string;
}

export interface StatusResponse {
  status: 'healthy' | 'error' | 'not-found';
  error?: string;
}

export async function handleFacebookIntegration({ subdomain, data }) {
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
    if (type === 'facebook') {
      response.data = await handleFacebookMessage(models, data, subdomain);
    }

    if (action === 'getConfigs') {
      response.data = await models.FacebookConfigs.find({});
    }
  } catch (e) {
    response = {
      status: 'error',
      errorMessage: e.message,
    };
  }

  return response;
}

export async function facebookCreateIntegrations({ subdomain, data }) {
  try {
    return await facebookCreateIntegration(subdomain, data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to create integration: ${e.message}`,
    };
  }
}

export async function facebookUpdateIntegrations({
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

    const integration = await models.FacebookIntegrations.findOne({
      erxesApiId: integrationId,
    });

    if (!integration) {
      return {
        status: 'error',
        errorMessage: 'Integration not found.',
      };
    }

    await models.FacebookIntegrations.updateOne(
      { erxesApiId: integrationId },
      { $set: details },
    );

    return {
      status: 'success',
    };
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to update integration: ${e.message}`,
    };
  }
}

export async function facebookRemoveIntegrations({
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

export async function facebookRemoveAccount({
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

export async function facebookRepairIntegrations({
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

export async function facebookStatus({
  subdomain,
  data: { integrationId },
}: {
  subdomain: string;
  data: { integrationId: string };
}): Promise<{ data: any; status: string }> {
  try {
    const models = await generateModels(subdomain);

    const integration = await models.FacebookIntegrations.findOne({
      erxesApiId: integrationId,
    });

    let result = {
      status: 'healthy',
    } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || 'healthy',
        error: integration.error,
      };
    }

    return {
      data: result,
      status: 'success',
    };
  } catch (error) {
    return {
      data: {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      status: 'error',
    };
  }
}
