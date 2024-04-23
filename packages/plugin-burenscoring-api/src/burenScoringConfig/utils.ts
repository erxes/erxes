import fetch from 'node-fetch';

export const getAuthHeaders = async (args: {
  client_id: string;
  secretKey: string;
  contentType: 'application/xml' | 'application/json';
}) => {
  const { client_id, secretKey, contentType = 'application/json' } = args;


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
