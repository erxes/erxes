import { metaConnections, runAs, system, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { type ConnectionRow, markRefused, tokenOf } from './connections.service';
import { type Item, itemsOf } from './parse';
import { customerFor, linkedCustomers, type Person, whoIs } from './people';

const log = logger.child({ component: 'meta' });

const nameOf = async (row: ConnectionRow, token: string, person: Person) => {
  if (person.name) return { firstName: person.name };

  const found = await whoIs(row.kind, token, person.externalId).catch(async (error: unknown) => {
    await markRefused(row.orgId, row.id, error);
    log.warn({ err: error, connectionId: row.id }, 'Meta profile not read');

    return null;
  });

  return found ?? { firstName: person.externalId };
};

const customersOf = async (row: ConnectionRow, token: string, items: Item[]) => {
  const people = [...new Map(items.map((item) => [item.person.externalId, item.person])).values()];

  const known = await withOrg(row.orgId, (tx) =>
    linkedCustomers(
      tx,
      row.kind,
      people.map((person) => person.externalId),
    ),
  );

  await inOrder(
    people.filter((person) => !known.has(person.externalId)),
    async (person) => {
      const name = await nameOf(row, token, person);

      const customerId = await runAs(system('Meta message from a new person'), () =>
        withOrg(row.orgId, (tx) => customerFor(tx, row.kind, person.externalId, name)),
      );

      known.set(person.externalId, customerId);
    },
  );

  return known;
};

const InboundPayload = z.object({
  connectionId: z.string(),
  receivedAt: z.string(),
  events: z.array(z.unknown()).max(1000),
});

export const inboundJob = defineJob({
  queue: 'meta.inbound',
  payload: InboundPayload,
  timeoutSeconds: 120,
  retry: { attempts: 6 },
  concurrency: 4,
  async handle(job) {
    const { connectionId, receivedAt, events } = job.payload;

    const [row] = await withOrg(job.orgId, (tx) =>
      tx.select().from(metaConnections).where(eq(metaConnections.id, connectionId)).limit(1),
    );

    if (!row) return;

    const items = itemsOf(row, events, receivedAt);

    if (!items.length) return;

    const customers = await customersOf(row, tokenOf(row), items);

    await runAs(system('Meta delivery'), () =>
      withOrg(job.orgId, (tx) =>
        publishCoreEvents(
          tx,
          items.map((item) => ({
            type: item.type,
            subjectType: 'customer' as const,
            subjectId: customers.get(item.person.externalId) ?? null,
            payload: { ...item.payload, connectionId: row.id, accountId: row.externalId },
            dedupeKey: `meta:${row.id}:${item.key}`,
          })),
        ),
      ),
    );
  },
});
