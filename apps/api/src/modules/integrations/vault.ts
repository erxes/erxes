import { requestOrgId } from '@erxes/core-db';
import { z } from 'zod';
import { sealFor, unsealFor } from '~/lib/secrets';

const Values = z.record(z.string(), z.unknown());

export type VaultValues = z.infer<typeof Values>;

export const sealValues = (values: unknown) => sealFor(requestOrgId(), JSON.stringify(values));

export const openValues = (row: { orgId: string }, sealed: string): VaultValues =>
  Values.parse(JSON.parse(unsealFor(row.orgId, sealed)));

export const openSealed = <T>(row: { orgId: string }, sealed: string, schema: z.ZodType<T>): T =>
  schema.parse(JSON.parse(unsealFor(row.orgId, sealed)));
