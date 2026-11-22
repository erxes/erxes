import fetch from 'node-fetch';
import { redis } from 'erxes-api-shared/utils';

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
    const res = await fetch(
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
    );

    const response = await res.json().catch(() => ({}));

    // the bank answers errors with a JSON body and no token; report its
    // reason instead of failing later on an undefined token / expiry
    if (!res.ok || !response.access_token) {
      throw new Error(
        `Khanbank auth failed (${res.status}): ${response.code || ''} ${
          response.message || ''
        }`.trim(),
      );
    }

    // cache the token a minute less than it lives; a token that lives a
    // minute or less is used once and not cached, so an expired token is
    // never served from the cache
    const ttl = Math.floor(Number(response.access_token_expires_in)) - 60;

    if (ttl > 0) {
      await redis.set(
        `khanbank_token_${consumerKey}:${secretKey}`,
        response.access_token,
        'EX',
        ttl,
      );
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.access_token}`,
    };
  } catch (e) {
    console.error(`[khanbank] auth error: ${e.message}`);
    throw new Error(e.message || 'Authentication failed');
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
