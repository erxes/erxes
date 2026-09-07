import { IViberAccountInfo } from '@/integrations/viber/@types/account';

export const parseViberAccountInfo = (value: unknown): IViberAccountInfo => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid Viber account info response');
  }

  if (!('status' in value) || value.status !== 0) {
    throw new Error('Invalid Viber account info response');
  }

  if (!('id' in value) || !('name' in value)) {
    throw new Error('Invalid Viber account info response');
  }

  const { id, name } = value;

  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid Viber account info response');
  }

  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('Invalid Viber account info response');
  }

  return { id, name };
};

export const getViberAccountInfo = async (
  token: string,
): Promise<IViberAccountInfo> => {
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Viber bot token is required');
  }

  const response = await fetch(
    'https://chatapi.viber.com/pa/get_account_info',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Viber-Auth-Token': token,
      },
      body: '{}',
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Viber account info request failed (HTTP ${response.status})`,
    );
  }

  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new Error('Invalid Viber account info response');
  }

  return parseViberAccountInfo(value);
};
