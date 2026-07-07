import fetch from 'node-fetch';
import { redis } from 'erxes-api-shared/src/utils/redis';

export const getAuthHeaders = async (args: {
  consumerKey: string;
  secretKey: string;
}) => {
  const { consumerKey, secretKey } = args;

  const accessToken = await redis.get(
    `khanbank_token_${consumerKey}:${secretKey}`,
  );

  if (accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const apiUrl = 'https://api.khanbank.com/v1';

  try {
    const response = await fetch(
      `${apiUrl}/auth/token?grant_type=client_credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${consumerKey}:${secretKey}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());

    await redis.set(
      `khanbank_token_${consumerKey}:${secretKey}`,
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

export const formatDateToYYYYMMDD = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};
