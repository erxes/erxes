import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

export const assertSenderAllowed = async (
  subdomain: string,
  fromEmail: string,
  { fromPlaceholder = false }: { fromPlaceholder?: boolean } = {},
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
      input: { email: fromEmail, fromPlaceholder },
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
      fromPlaceholder
        ? `"${fromEmail}" came from a placeholder but is not a team member's address. Only team members and verified senders can send this email.`
        : `"${fromEmail}" is not a verified sender. Verify it under Settings → Mail config, or pick one that already is.`,
    );
  }
};
