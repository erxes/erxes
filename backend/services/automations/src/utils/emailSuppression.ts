import { ISuppressionPort, sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Suppression lives with core's `email_addresses`; this service holds no models
 * and must not decide on its own who may be mailed.
 */
export const createSuppressionPort = (subdomain: string): ISuppressionPort => ({
  async blocked(emails, source) {
    return (
      (await sendTRPCMessage({
        subdomain,
        method: 'query',
        pluginName: 'core',
        module: 'emailSuppression',
        action: 'blocked',
        input: { emails, source },
      })) || []
    );
  },
});
