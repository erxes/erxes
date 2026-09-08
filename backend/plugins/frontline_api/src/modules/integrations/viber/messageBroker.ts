import { withErrorHandling } from '~/shared/utils';
import { createViberIntegration } from '@/integrations/viber/helpers';

export interface IViberIntegrationInput {
  subdomain: string;
  data: {
    integrationId: string;
    data?: string;
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
  },
);
