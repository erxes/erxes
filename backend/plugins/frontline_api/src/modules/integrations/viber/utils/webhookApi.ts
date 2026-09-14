import { validateViberToken } from '@/integrations/viber/utils/account';

export const setViberWebhook = async (
  token: string,
  callbackUrl: string,
): Promise<void> => {
  validateViberToken(token);

  if (typeof callbackUrl !== 'string' || callbackUrl !== callbackUrl.trim()) {
    throw new Error('Invalid Viber webhook URL');
  }

  if (callbackUrl !== '') {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(callbackUrl);
    } catch {
      throw new Error('Invalid Viber webhook URL');
    }

    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.hash
    ) {
      throw new Error('Invalid Viber webhook URL');
    }
  }

  const body =
    callbackUrl === ''
      ? { url: '' }
      : {
          url: callbackUrl,
          send_name: true,
          send_photo: false,
        };

  const response = await fetch('https://chatapi.viber.com/pa/set_webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Viber-Auth-Token': token,
    },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Viber webhook request failed (HTTP ${response.status})`);
  }

  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new Error('Invalid Viber webhook response');
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('status' in value) ||
    typeof value.status !== 'number' ||
    !Number.isInteger(value.status)
  ) {
    throw new Error('Invalid Viber webhook response');
  }

  if (value.status !== 0) {
    throw new Error(`Viber webhook update failed (status ${value.status})`);
  }
};
