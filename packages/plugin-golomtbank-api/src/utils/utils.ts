import fetch from 'node-fetch';

import redis from '../redis';

export const getAuthHeaders = async (args: {
  name: string,
  organizationName: string,
  ivKey: string,
  sessionKey: string,
  clientId: string,
  configPassword: string,
  registerId: string
}) => {
  const { clientId, sessionKey } = args;

  const accessToken = await redis.get(
    `golomtbank_token_${clientId}:${sessionKey}`,
  );

  if (accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const apiUrl = 'https://api.golomt.com/v';

  try {
    const response = await fetch(
      `${apiUrl}/auth/token?grant_type=client_credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${sessionKey}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());

    await redis.set(
      `khanbank_token_${clientId}:${sessionKey}`,
      response.access_token,
      'EX',
      response.access_token_expires_in - 60,
    );

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.access_token}`,
    };
  } catch (e) {
    console.error(e.message);
    throw new Error('Authentication failed');
  }
};

export const formatDate = (date: string) => {
  return date.replace(/-/g, '');
};
