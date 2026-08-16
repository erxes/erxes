import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

export const assertSenderAllowed = async (
  subdomain: string,
  fromEmail: string,
) => {
  if (!fromEmail) {
    return;
  }

  let result: { allowed: boolean } | undefined;

  try {
    result = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'emailSenders',
      action: 'isAllowed',
      input: { email: fromEmail },
    });
  } catch (e) {
    debugError(`Could not check sender "${fromEmail}": ${e.message}`);
    return;
  }

  if (!result) {
    debugError(`Could not check sender "${fromEmail}": core did not answer`);
    return;
  }

  if (!result.allowed) {
    throw new Error(
      `"${fromEmail}" is not a verified sender. Verify it under Settings → Mail config, or pick one that already is.`,
    );
  }
};
