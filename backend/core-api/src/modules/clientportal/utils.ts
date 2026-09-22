import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { getEnv } from 'erxes-api-shared/utils';

export function normalizeEmail(email: string): string {
  return (email || '').toLowerCase().trim();
}

export function validatePhoneFormat(phone: string): boolean {
  if (!phone) {
    return false;
  }
  return phone.length >= 8;
}

export const handleCPUserDeviceToken = async (
  cpUser: ICPUserDocument,
  deviceToken: string,
) => {
  if (deviceToken && cpUser) {
    const deviceTokens: string[] = (cpUser as any).deviceTokens || [];

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);

      await cpUser.updateOne({ $set: { deviceTokens } });
    }
  }
};

export const getTokiConnection = (clientPortal: IClientPortalDocument) => {
  const tokiConfig = clientPortal?.auth?.tokiConfig;

  if (!tokiConfig) {
    throw new Error('Toki configuration is not set');
  }

  const { production = false, apiKey } = tokiConfig;

  if (!apiKey) {
    throw new Error('Toki API key is not set');
  }

  const envName = production ? 'TOKI_PRODUCTION_API_URL' : 'TOKI_TEST_API_URL';
  const configuredApiUrl = getEnv({ name: envName });

  return {
    apiUrl: configuredApiUrl,
    apiKey,
  };
};
