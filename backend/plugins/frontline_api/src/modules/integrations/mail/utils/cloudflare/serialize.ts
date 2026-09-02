import { IMailCloudflareDocument } from '@/integrations/mail/@types/cloudflare';
import { workerScriptVersion } from '@/integrations/mail/utils/cloudflare/worker';

export const toPublicConnection = (
  connection: IMailCloudflareDocument | null,
) => {
  if (!connection) {
    return null;
  }

  return {
    zoneName: connection.zoneName,
    accountName: connection.accountName,
    workerOrigin: connection.workerOrigin,
    scriptVersion: connection.scriptVersion,
    sendingEnabled: Boolean(connection.sendingEnabled),
    currentScriptVersion: workerScriptVersion(),
    status: connection.status,
    steps: connection.steps ?? [],
    error: connection.error,
    connectedAt: connection.connectedAt,
  };
};
