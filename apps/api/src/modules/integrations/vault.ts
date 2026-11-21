import { caller, requestOrgId } from '@erxes/core-db';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { sealFor, unsealFor } from '~/lib/secrets';

const Values = z.record(z.string(), z.unknown());

export type VaultValues = z.infer<typeof Values>;

export const sealValues = (values: unknown) => sealFor([requestOrgId()], JSON.stringify(values));

export const openValues = (row: { orgId: string }, sealed: string): VaultValues =>
  Values.parse(JSON.parse(unsealFor([row.orgId], sealed)));

export const openSealed = <T>(row: { orgId: string }, sealed: string, schema: z.ZodType<T>): T =>
  schema.parse(JSON.parse(unsealFor([row.orgId], sealed)));

const pluginBinding = () => [requestOrgId(), caller('plugin').plugin];

export const sealPluginValues = (values: VaultValues) => ({
  sealed: sealFor(pluginBinding(), JSON.stringify(values)),
});

const unsealPlugin = (sealed: string) => {
  try {
    return unsealFor(pluginBinding(), sealed);
  } catch {
    const message = 'This text was not sealed for this plugin in this organisation, or it changed';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['sealed'], message }] });
  }
};

export const openPluginValues = (sealed: string) => ({
  values: Values.parse(JSON.parse(unsealPlugin(sealed))),
});
