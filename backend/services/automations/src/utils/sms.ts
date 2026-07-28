import { isEnabled, sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';
import { getConfig } from './utils';

/**
 * Sends an SMS through the given provider.
 * Mirrors the legacy `sendSms(subdomain, "messagePro", phone, text)` signature.
 */
export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string,
) => {
  if (type === 'messagePro') {
    const MESSAGE_PRO_API_KEY = await getConfig(
      subdomain,
      'MESSAGE_PRO_API_KEY',
      '',
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      subdomain,
      'MESSAGE_PRO_PHONE_NUMBER',
      '',
    );

    if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
      throw new Error('messaging config not set properly');
    }

    try {
      const response = await fetch('https://api-text.callpro.mn/v1/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MESSAGE_PRO_API_KEY,
        },
        body: JSON.stringify({
          from: MESSAGE_PRO_PHONE_NUMBER,
          to: phoneNumber,
          text: content,
        }),
      });
      const rawBody = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = rawBody;
      }

      if (!response.ok) {
        throw new Error(
          `SMS request failed: ${response.status} ${response.statusText} - ${rawBody}`,
        );
      }

      if (data?.success === false) {
        throw new Error(`SMS provider error: ${data?.message || rawBody}`);
      }
      return 'sent';
    } catch (e) {
      debugError((e as Error).message);
      throw e;
    }
  }

  const isServiceEnabled = await isEnabled(type);

  if (!isServiceEnabled) {
    throw new Error('messaging service not enabled');
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: type,
    method: 'mutation',
    module: type,
    action: 'sendSms',
    input: {
      phoneNumber,
      content,
    },
  });
};
