import { ISuppressionPort, sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

export const createSuppressionPort = (subdomain: string): ISuppressionPort => ({
  async blocked(emails, source) {
    const result: { emails: string[] } | undefined = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'emailSuppression',
      action: 'blocked',
      input: { emails, source },
    });

    if (!result) {
      debugError(
        `Could not read email suppression from core for source "${source}": treating every recipient as allowed`,
      );

      return [];
    }

    return result.emails;
  },
});
