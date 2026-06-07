import fetch from 'node-fetch';
import { redis } from 'erxes-api-shared/src/utils/redis';
import { encryptPassword } from './encryptPassword';

export const getAuthHeaders = async (args: {
  name: string;
  organizationName: string;
  ivKey: string;
  sessionKey: string;
  clientId: string;
  configPassword: string;
  registerId: string;
  golomtCode?: string;
  apiUrl: string;
}) => {
  const { name, ivKey, clientId, configPassword, sessionKey, apiUrl } = args;

  if (!apiUrl) {
    throw new Error('Not found apiUrl');
  }

  const cacheKey = `golomtbank_token_${clientId}:${sessionKey}`;

  const accessToken = await redis.get(cacheKey);

  if (accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  try {
    const encrypted = encryptPassword(configPassword, sessionKey, ivKey);

    const response = await fetch(`${apiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        password: encrypted,
      }),
    }).then((res) => res.json());

    if (!response?.token) {
      throw new Error('Invalid auth response');
    }

    // 🔹 Cache token in Redis (expires a bit earlier than server)
    await redis.set(cacheKey, response.token, 'EX', response.expiresIn - 60);

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.token}`,
    };
  } catch (e: any) {
    console.error(e);
    throw new Error('Authentication failed');
  }
};

export const formatDate = (date: string) => {
  return date.replace(/-/g, '');
};
