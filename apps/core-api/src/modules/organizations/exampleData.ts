import { companies, customers, type Db, leadStages, roles, users } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Actor } from '~/http/auth';
import { lockOrganization } from '~/lib/locks';
import { defineJob } from '~/modules/jobs/jobs';
import { addNote } from '~/modules/activities/activities.service';
import { createAutomation } from '~/modules/automations/automations.service';
import { AUTOMATION_TEMPLATES } from '~/modules/automations/library';
import { createCompany } from '~/modules/companies/companies.service';
import { createCustomer, linkCustomerCompany } from '~/modules/customers/customers.service';
import { createField } from '~/modules/fields/fields.service';
import { createTag } from '~/modules/tags/tags.service';
import { createView } from '~/modules/views/views.service';
import type { ExampleCopy } from './exampleCopy';
import { EXAMPLE_COPY_EN } from './exampleCopyEn';
import { EXAMPLE_COPY_MN } from './exampleCopyMn';

/**
 * Example data for a fresh organisation, so its first look isn't empty (as
 * HubSpot and Attio do): companies, customers and leads across the lead
 * stages, linked with roles, tags, two custom fields, timeline notes, a saved
 * view and a welcome automation left off. Everything is tagged "Example", so
 * it can be filtered and deleted in one go. Emails are `@example.com` (never
 * delivered). Written through the services, so timelines, search and events
 * are what real records get.
 */

const ExampleLanguage = z.enum(['en', 'mn']);

export type ExampleLanguage = z.infer<typeof ExampleLanguage>;

const COPY: Record<ExampleLanguage, ExampleCopy> = { en: EXAMPLE_COPY_EN, mn: EXAMPLE_COPY_MN };

type Person = ExampleCopy['people'][number];

const isoDay = (days: number) => {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

/** The tags and custom fields the example records use. */
const seedLabels = async (tx: Db, actor: Actor, copy: ExampleCopy) => {
  const tag = async (type: 'customer' | 'company', name: string, colorCode: string) =>
    (await createTag(tx, actor, { type, name, colorCode })).id;

  return {
    exampleCustomer: await tag('customer', copy.tags.example, '#94a3b8'),
    vip: await tag('customer', copy.tags.vip, '#f59e0b'),
    exampleCompany: await tag('company', copy.tags.example, '#94a3b8'),
    partner: await tag('company', copy.tags.partner, '#10b981'),
    plan: await createField(tx, actor, {
      contentType: 'customer',
      label: copy.plan.label,
      type: 'select',
      options: copy.plan.options,
    }),
    renewal: await createField(tx, actor, {
      contentType: 'customer',
      label: copy.renewal,
      type: 'date',
    }),
  };
};

type Labels = Awaited<ReturnType<typeof seedLabels>>;

interface Seeding {
  tx: Db;
  actor: Actor;
  copy: ExampleCopy;
  labels: Labels;
  stages: { id: string }[];
  companyIds: string[];
}

const customFieldsOf = ({ copy, labels }: Seeding, person: Person) => {
  const plan = person.plan === undefined ? undefined : copy.plan.options[person.plan];

  return {
    ...(plan ? { [labels.plan.id]: plan } : {}),
    ...(person.renewalInDays === undefined
      ? {}
      : { [labels.renewal.id]: isoDay(person.renewalInDays) }),
  };
};

/** One customer or lead, linked to its company, with its note. */
const seedPerson = async (seeding: Seeding, person: Person) => {
  const { tx, actor, labels } = seeding;
  const lead = person.stage === undefined ? undefined : seeding.stages[person.stage];

  const created = await createCustomer(tx, actor, {
    firstName: person.first,
    lastName: person.last,
    primaryEmail: person.email,
    primaryPhone: person.phone,
    position: person.position,
    ownerId: actor.userId,
    ...(person.birthDate ? { birthDate: person.birthDate } : {}),
    tagIds: person.vip ? [labels.exampleCustomer, labels.vip] : [labels.exampleCustomer],
    customFields: customFieldsOf(seeding, person),
    ...(lead
      ? {
          state: 'lead' as const,
          leadStageId: lead.id,
          source: person.source ?? null,
          ...(person.reason ? { disqualifyReason: person.reason } : {}),
        }
      : { state: 'customer' as const }),
  });

  const companyId = person.company === undefined ? undefined : seeding.companyIds[person.company];

  if (companyId) {
    await linkCustomerCompany(tx, actor, created.id, companyId, {
      role: person.role ?? null,
      isPrimaryContact: person.mainContact ?? false,
    });
  }

  if (person.note) {
    await addNote(tx, actor, {
      targetType: 'customer',
      targetId: created.id,
      body: person.note,
      mentions: [],
      fileIds: [],
    });
  }
};

const hasContacts = async (tx: Db, orgId: string) => {
  const [existing] = await tx
    .select({
      any: sql<boolean>`exists (select 1 from ${customers} where ${customers.orgId} = ${orgId})
        or exists (select 1 from ${companies} where ${companies.orgId} = ${orgId})`,
    })
    .from(sql`(select 1) as one`);

  return existing?.any === true;
};

/**
 * Seeds the example data, once: only while the organisation has no customers
 * and no companies (the organisation row is locked, so two members finishing
 * the welcome steps at once can't both seed). Returns whether it did.
 */
const seedExampleData = async (tx: Db, actor: Actor, language: ExampleLanguage) => {
  await lockOrganization(tx, actor.orgId);

  if (await hasContacts(tx, actor.orgId)) return { seeded: false };

  const copy = COPY[language];
  const labels = await seedLabels(tx, actor, copy);
  const companyIds: string[] = [];

  for (const company of copy.companies) {
    const created = await createCompany(tx, actor, {
      primaryName: company.name,
      industry: company.industry,
      website: company.website,
      size: company.size,
      ownerId: actor.userId,
      tagIds: company.partner ? [labels.exampleCompany, labels.partner] : [labels.exampleCompany],
    });

    companyIds.push(created.id);
  }

  const stages = await tx
    .select({ id: leadStages.id })
    .from(leadStages)
    .where(eq(leadStages.orgId, actor.orgId))
    .orderBy(asc(leadStages.order));

  for (const person of copy.people) {
    await seedPerson({ tx, actor, copy, labels, stages, companyIds }, person);
  }

  await createView(tx, actor, {
    recordType: 'customer',
    name: copy.vipView,
    shared: true,
    filter: {
      match: 'all',
      rules: [{ path: 'subject.tagIds', op: 'contains', value: labels.vip }],
    },
  });

  const welcome = AUTOMATION_TEMPLATES.find((template) => template.id === 'welcome');

  if (welcome) {
    await createAutomation(tx, actor, { ...copy.automation, definition: welcome.definition });
  }

  return { seeded: true };
};

/**
 * Seeded by a job right after the welcome steps: through the services it is a
 * few hundred statements (a second next to the database, a minute over a slow
 * link), so finishing the steps doesn't wait for it. Atomic: the example data
 * appears all at once or not at all.
 */
export const exampleDataJob = defineJob({
  queue: 'organization.example_data',
  atomic: true,
  leaseSeconds: 900,
  payload: z.object({ userId: z.string(), language: ExampleLanguage.default('en') }),
  async handle(job, tx) {
    const [member] = await tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        permissions: roles.permissions,
      })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.orgId, job.orgId), eq(users.id, job.payload.userId)))
      .limit(1);

    // Only for an owner still with the organisation.
    if (!member || member.status !== 'active' || member.role !== 'owner') return;

    await seedExampleData(
      tx,
      { userId: member.id, orgId: job.orgId, role: member.role, permissions: member.permissions },
      job.payload.language,
    );
  },
});
