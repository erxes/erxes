import { sendRequest } from '@erxes/api-utils/src/requests';

import redis from '../redis';

export const getAuthHeaders = async (args: {
  consumerKey: string;
  secretKey: string;
}) => {
  const { consumerKey, secretKey } = args;

  const accessToken = await redis.get(
    `khanbank_token_${consumerKey}:${secretKey}`
  );

  if (accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    };
  }

  const apiUrl = 'https://api.khanbank.com/v1';

  try {
    const response = await sendRequest({
      url: `${apiUrl}/auth/token?grant_type=client_credentials`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${consumerKey}:${secretKey}`
        ).toString('base64')}`
      }
    });

    await redis.set(
      `khanbank_token_${consumerKey}:${secretKey}`,
      response.access_token,
      'EX',
      response.access_token_expires_in - 60
    );

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.access_token}`
    };
  } catch (e) {
    console.error(e.message);
    throw new Error('Authentication failed');
  }
};

export const formatDate = (date: string) => {
  return date.replace(/-/g, '');
};
