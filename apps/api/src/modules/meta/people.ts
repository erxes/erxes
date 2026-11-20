import type { MetaKind } from '@erxes/core-contract';
import { type Db, metaPeople, requestOrgId } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { lockKeys } from '~/lib/locks';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { graph } from './graph';

export interface Person {
  externalId: string;
  name?: string;
}

const FacebookPerson = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

const InstagramPerson = z.object({ name: z.string().optional(), username: z.string().optional() });

export const whoIs = async (kind: MetaKind, token: string, id: string) => {
  if (kind === 'instagram') {
    const { name, username } = InstagramPerson.parse(
      await graph(id, token, { query: { fields: 'name,username' } }),
    );

    const firstName = name || (username && `@${username}`);

    return firstName ? { firstName } : null;
  }

  const person = FacebookPerson.parse(
    await graph(id, token, { query: { fields: 'first_name,last_name' } }),
  );

  return person.first_name ? { firstName: person.first_name, lastName: person.last_name } : null;
};

export const linkedCustomers = async (client: Db, kind: MetaKind, ids: string[]) => {
  const rows = ids.length
    ? await client
        .select({ externalId: metaPeople.externalId, customerId: metaPeople.customerId })
        .from(metaPeople)
        .where(and(eq(metaPeople.kind, kind), inArray(metaPeople.externalId, ids)))
    : [];

  return new Map(rows.map((row) => [row.externalId, row.customerId]));
};

export const customerFor = async (
  client: Db,
  kind: MetaKind,
  externalId: string,
  name: { firstName: string; lastName?: string },
) => {
  await lockKeys(client, [`meta-person:${requestOrgId()}:${kind}:${externalId}`]);

  const found = (await linkedCustomers(client, kind, [externalId])).get(externalId);

  if (found) return found;

  const { customer } = await findOrCreateCustomer(client, {
    ...name,
    state: 'lead',
    source: kind,
  });

  await client.insert(metaPeople).values({ kind, externalId, customerId: customer.id });

  return customer.id;
};
