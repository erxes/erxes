import fetch from 'node-fetch';

import redis from '../redis';

export const getAuthHeaders = async (args: {
  client_id: string;
  secretKey: string;
  contentType: 'application/xml' | 'application/json';
}) => {
  const { client_id, secretKey, contentType = 'application/json' } = args;

  const accessToken = await redis.get(`zms_token_${client_id}:${secretKey}`);

  if (accessToken) {
    return {
      'Content-Type': contentType,
      Authorization: `Bearer ${accessToken}`,
      'X-Username': client_id,
      'X-Signature': secretKey,
    };
  }

  const apiUrl = 'https://staging-api.burenscore.mn';

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
        Authorization: `Bearer token`,
      },
      body: JSON.stringify({
        client_id: client_id,
        secretKey: secretKey,
      }),
    }).then((res) => res.json());

    await redis.set(
      `zms_token_${client_id}:${secretKey}`,
      response.access_token,
      'EX',
      60 * 1000 * 5 - 10,
    );

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.access_token}`,
      'X-Username': client_id,
      'X-Signature': secretKey,
    };
  } catch (e) {
    console.error(e.message);
    throw new Error('Authentication failed');
  }
};

export const formatDate = (date: string) => {
  return date.replace(/-/g, '');
};
