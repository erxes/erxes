import { PLUGIN_SCOPES, connectionUseScope, pluginReadScope } from '@erxes/core-contract';
import type { plugins } from '@erxes/core-db';

/**
 * Scopes a plugin asks for: its manifest's, with each read of another plugin's API as
 * `reads:<permission>` and each integration whose connections it uses as `uses:<key>`, or
 * (before it sent one) what plugins could always do.
 */
export const requestedScopes = (row: Pick<typeof plugins.$inferSelect, 'manifest'>): string[] =>
  row.manifest
    ? [
        ...row.manifest.scopes,
        ...(row.manifest.pluginReads ?? []).flatMap((read) =>
          read.permissions.map(pluginReadScope),
        ),
        ...(row.manifest.connections ?? []).map((use) => connectionUseScope(use.integration)),
      ]
    : [...PLUGIN_SCOPES];
