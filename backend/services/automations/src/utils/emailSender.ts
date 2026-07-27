import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

/**
 * Refuses to send from an address the provider has not accepted as a sender.
 *
 * The rule itself lives in core, next to the sender records, so the automation
 * builder and this check can never disagree about what is allowed.
 *
 * A failure to reach core does not block the send: this guard exists to turn a
 * misconfiguration into a clear error, not to be the last line of defence — the
 * provider still rejects an unverified sender on its own.
 */
export const assertSenderAllowed = async (
  subdomain: string,
  fromEmail: string,
) => {
  if (!fromEmail) {
    return;
  }

  let allowed: boolean;

  try {
    allowed = await sendTRPCMessage({
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

  if (!allowed) {
    throw new Error(
      `"${fromEmail}" is not a verified sender. Verify it under Settings → Mail config, or pick one that already is.`,
    );
  }
};
