import { withErrorHandling } from '~/shared/utils';
import {
  createViberIntegration,
  removeViberIntegration,
  registerViberWebhook,
} from '@/integrations/viber/helpers';
import { generateModels } from '~/connectionResolvers';
import {
  VIBER_HEALTH_STATUSES,
  type ViberHealthStatus,
} from '@/integrations/viber/constants';

export interface IViberIntegrationInput {
  subdomain: string;
  data: {
    integrationId: string;
    data?: string;
  };
}

export interface IViberIntegrationRefInput {
  subdomain: string;
  data: {
    integrationId: string;
  };
}

const parseViberToken = (jsonData?: string): string => {
  if (!jsonData?.trim()) {
    throw new Error('Viber integration data is required');
  }

  let value: unknown;

  try {
    value = JSON.parse(jsonData);
  } catch {
    throw new Error('Invalid Viber integration data');
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid Viber integration data');
  }

  if (!('token' in value)) {
    throw new Error('Viber bot token is required');
  }
  const { token } = value;

  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('Viber bot token is required');
  }

  return token;
};

export const viberCreateIntegration = withErrorHandling(
  async ({ subdomain, data }: IViberIntegrationInput): Promise<void> => {
    const token = parseViberToken(data.data);

    await createViberIntegration(subdomain, data.integrationId, token);
    await registerViberWebhook(subdomain, data.integrationId);
  },
);

export const viberRemoveIntegration = async ({
  subdomain,
  data,
}: IViberIntegrationRefInput): Promise<string> => {
  await removeViberIntegration(subdomain, data.integrationId);

  return data.integrationId;
};

export const viberRepairIntegration = async ({
  subdomain,
  data,
}: IViberIntegrationRefInput): Promise<boolean> => {
  await registerViberWebhook(subdomain, data.integrationId);

  return true;
};

export const viberStatus = async ({
  subdomain,
  data: { integrationId },
}: IViberIntegrationRefInput): Promise<{
  status: 'success' | 'error';
  data: {
    status: ViberHealthStatus;
    error: string;
  };
}> => {
  try {
    if (!subdomain.trim() || !integrationId.trim()) {
      throw new Error('Viber tenant and integration id are required');
    }

    const models = await generateModels(subdomain);

    const integration = await models.ViberIntegrations.findOne({
      inboxId: integrationId,
    }).select('healthStatus error');

    if (!integration) {
      return {
        status: 'success',
        data: {
          status: VIBER_HEALTH_STATUSES.UNHEALTHY,
          error: 'Viber connection not found. Reconnect the integration.',
        },
      };
    }

    return {
      status: 'success',
      data: {
        status: integration.healthStatus ?? VIBER_HEALTH_STATUSES.PENDING,
        error: integration.error ?? '',
      },
    };
  } catch {
    return {
      status: 'error',
      data: {
        status: VIBER_HEALTH_STATUSES.UNHEALTHY,
        error: 'Unable to read Viber connection status. Try again.',
      },
    };
  }
};
