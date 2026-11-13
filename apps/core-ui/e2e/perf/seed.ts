// Seeds the synthetic org the perf run measures: 2,000 customers, 200 leads, 10 draft
// automations and 300 notes, through the typed core client. Run once on a fresh org:
//   API_URL=http://localhost:3400 EMAIL=owner@acme.test PASSWORD=… node apps/core-ui/e2e/perf/seed.ts
import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { env, stdout } from 'node:process';

const API = `${env.API_URL ?? 'http://localhost:3400'}${CORE_API_PREFIX}`;
const { EMAIL, PASSWORD, SUBDOMAIN = 'acme' } = env;

if (!EMAIL || !PASSWORD) throw new Error('EMAIL and PASSWORD are required');

// The session token comes back only as a cookie, so sign-in is a plain request.
const signIn = await fetch(`${API}/auth/sign-in`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, subdomain: SUBDOMAIN }),
});

const token = /erxes_session=([^;]+)/.exec(signIn.headers.get('set-cookie') ?? '')?.[1];

if (!token) throw new Error(`sign-in failed: ${signIn.status} ${await signIn.text()}`);

const core: ContractRouterClient<typeof coreContract> = createORPCClient(
  new OpenAPILink(coreContract, { url: API, headers: { authorization: `Bearer ${token}` } }),
);

/** Runs `task` for 0..count-1, eight at a time. */
const times = async <T>(count: number, task: (i: number) => Promise<T>) => {
  const results: T[] = [];

  for (let start = 0; start < count; start += 8) {
    const batch = Array.from({ length: Math.min(8, count - start) }, (_, k) => task(start + k));

    results.push(...(await Promise.all(batch)));
  }

  return results;
};

const existing = await core.customers.list({ limit: 1 });

if (existing.data.length > 0) throw new Error('the org already has customers; seed a fresh one');

await core.auth.onboarded({ exampleData: false, language: 'en' });

const TAGS = [
  ['VIP', '#e11d48'],
  ['Newsletter', '#2563eb'],
  ['Partner', '#16a34a'],
  ['Churn risk', '#d97706'],
] as const;

const tags = await Promise.all(
  TAGS.map(([name, colorCode]) => core.tags.create({ type: 'customer', name, colorCode })),
);

const FIRST = ['Alice', 'Bruno', 'Chloe', 'Dmitri', 'Elena', 'Farid', 'Greta', 'Hugo', 'Ines'];
const LAST = ['Anders', 'Baker', 'Carter', 'Dorn', 'Ellis', 'Faulk', 'Gale', 'Hart', 'Ivory'];
const POSITIONS = ['Engineer', 'Designer', 'Buyer', 'Founder', 'Analyst', 'Support', 'CFO'];

const person = (i: number) => {
  const firstName = FIRST[i % FIRST.length] ?? 'Alex';
  const lastName = `${LAST[Math.floor(i / FIRST.length) % LAST.length] ?? 'Doe'} ${i}`;

  return {
    firstName,
    lastName,
    primaryEmail: `${firstName.toLowerCase()}.${i}@example.com`,
    primaryPhone: `+1 555 ${String(i).padStart(6, '0')}`,
  };
};

const customers = await times(2000, (i) =>
  core.customers.create({
    ...person(i),
    state: 'customer',
    position: POSITIONS[i % POSITIONS.length],
    tagIds: tags.filter((_, t) => (i + t) % 3 === 0).map((tag) => tag.id),
    description: 'A synthetic customer for the perf run.',
  }),
);

// Every stage but the last (disqualified) gets leads.
const { data: stages } = await core.leads.stages();

await times(200, (i) =>
  core.customers.create({
    ...person(10_000 + i),
    state: 'lead',
    leadStageId: stages[i % Math.max(stages.length - 1, 1)]?.id,
    source: 'web-form',
  }),
);

// Automations stay drafts, so the seed and the run execute nothing.
const { data: templates } = await core.automations.templates();

await times(10, (i) => {
  const template = templates[i % templates.length];

  if (!template) throw new Error('no automation templates');

  return core.automations.create({
    name: `Synthetic automation ${i + 1}`,
    description: template.description,
    definition: template.definition,
  });
});

await times(300, (i) => {
  const customer = customers[i % 30];

  if (!customer) throw new Error('no customers to note');

  return core.activities.addNote({
    targetType: 'customer',
    targetId: customer.id,
    body: `Synthetic note ${i + 1}: called about the renewal, follow up next week.`,
  });
});

stdout.write('seeded: 4 tags, 2,000 customers, 200 leads, 10 draft automations, 300 notes\n');
