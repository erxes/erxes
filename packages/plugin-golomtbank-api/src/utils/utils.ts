import fetch from 'node-fetch';

import redis from '../redis';

export const getAuthHeaders = async (args: {
  userName: string,
  organizationName: string,
  ivKey: string,
  sessionKey: string,
  clientId: string,
  password: string
}) => {
  const { userName, organizationName, ivKey, sessionKey, clientId, password } = args;

  const accessToken = await redis.get(
    `golomtBank_token_${userName}:${organizationName}`,
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
            `${userName}:${organizationName}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());

    await redis.set(
      `khanbank_token_${userName}:${organizationName}`,
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
