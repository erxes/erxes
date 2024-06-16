import fetch from 'node-fetch';

export const getAuthHeaders = async (args: {
  client_id: string;
  secretKey: string;
  url: string;
  contentType: 'application/xml' | 'application/Json';
}) => {
  const { client_id, secretKey,url } = args;
  try {
    
    const response = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
