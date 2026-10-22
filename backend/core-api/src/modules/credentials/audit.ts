import { logHandler } from 'erxes-api-shared/utils';
import type { CredentialAuditAction, CredentialAuditMetadata } from './service';

export const auditCredentialEvent = async (
  tenant: string,
  action: CredentialAuditAction,
  metadata: CredentialAuditMetadata,
  userId?: string,
): Promise<void> => {
  // Build from an allowlist, never spread a record, arguments, request, error,
  // headers, name, description, custom field label, value, or token hash.
  await logHandler(() => undefined, {
    subdomain: tenant,
    source: 'auth',
    action: `credentials.${action}`,
    userId,
    payload: {
      credentialId: metadata.credentialId,
      templateId: metadata.templateId,
      grantId: metadata.grantId,
      pluginName: metadata.pluginName,
    },
  }, undefined, undefined, true);
};
