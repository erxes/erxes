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
      await fetch(
        'https://api.messagepro.mn/send?' +
          new URLSearchParams({
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: phoneNumber,
            text: content,
          }),
      );

      return 'sent';
    } catch (e) {
      debugError((e as Error).message);
      throw new Error((e as Error).message);
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
