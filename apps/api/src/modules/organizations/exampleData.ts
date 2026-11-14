import { LANGUAGES } from '@erxes/core-db/enums';
import {
  caller,
  companies,
  type ContentType,
  customers,
  type Db,
  leadStages,
  runAs,
} from '@erxes/core-db';
import { asc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { memberOf } from '~/http/auth';
import { lockOrganization } from '~/lib/locks';
import { inOrder } from '~/lib/sequence';
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

const ExampleLanguage = z.enum(LANGUAGES);

export type ExampleLanguage = z.infer<typeof ExampleLanguage>;

const COPY: Record<ExampleLanguage, ExampleCopy> = { en: EXAMPLE_COPY_EN, mn: EXAMPLE_COPY_MN };

type Person = ExampleCopy['people'][number];

const isoDay = (days: number) => {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

/** The tags and custom fields the example records use. */
const seedLabels = async (tx: Db, copy: ExampleCopy) => {
  const tag = async (type: ContentType, name: string, colorCode: string) =>
    (await createTag(tx, { type, name, colorCode })).id;

  return {
    exampleCustomer: await tag('customer', copy.tags.example, '#94a3b8'),
    vip: await tag('customer', copy.tags.vip, '#f59e0b'),
    exampleCompany: await tag('company', copy.tags.example, '#94a3b8'),
    partner: await tag('company', copy.tags.partner, '#10b981'),
    plan: await createField(tx, {
      contentType: 'customer',
      label: copy.plan.label,
      type: 'select',
      options: copy.plan.options,
    }),
    renewal: await createField(tx, {
      contentType: 'customer',
      label: copy.renewal,
      type: 'date',
    }),
  };
};

type Labels = Awaited<ReturnType<typeof seedLabels>>;

interface Seeding {
  tx: Db;
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
  const { tx, labels } = seeding;
  const lead = person.stage === undefined ? undefined : seeding.stages[person.stage];

  const created = await createCustomer(tx, {
    firstName: person.first,
    lastName: person.last,
    primaryEmail: person.email,
    primaryPhone: person.phone,
    position: person.position,
    ownerId: caller('user').userId,
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
    await linkCustomerCompany(tx, created.id, companyId, {
      role: person.role ?? null,
      isPrimaryContact: person.mainContact ?? false,
    });
  }

  if (person.note) {
    await addNote(tx, {
      targetType: 'customer',
      targetId: created.id,
      body: person.note,
      mentions: [],
      fileIds: [],
    });
  }
};

const hasContacts = async (tx: Db) => {
  const [existing] = await tx
    .select({
      any: sql<boolean>`exists (select 1 from ${customers})
        or exists (select 1 from ${companies})`,
    })
    .from(sql`(select 1) as one`);

  return existing?.any === true;
};

/**
 * Seeds the example data, once: only while the organisation has no customers
 * and no companies (the organisation row is locked, so two members finishing
 * the welcome steps at once can't both seed). Returns whether it did.
 */
/** Seeds as the member in scope (`runAs`), who owns the records. */
const seedExampleData = async (tx: Db, language: ExampleLanguage) => {
  await lockOrganization(tx);

  if (await hasContacts(tx)) return { seeded: false };

  const copy = COPY[language];
  const labels = await seedLabels(tx, copy);
  const companyIds: string[] = [];

  // One record after another through the full create pipeline; the people link to these ids.
  await inOrder(copy.companies, async (company) => {
    const created = await createCompany(tx, {
      primaryName: company.name,
      industry: company.industry,
      website: company.website,
      size: company.size,
      ownerId: caller('user').userId,
      tagIds: company.partner ? [labels.exampleCompany, labels.partner] : [labels.exampleCompany],
    });

    companyIds.push(created.id);
  });

  const stages = await tx
    .select({ id: leadStages.id })
    .from(leadStages)
    .orderBy(asc(leadStages.order));

  await inOrder(copy.people, (person) =>
    seedPerson({ tx, copy, labels, stages, companyIds }, person),
  );

  await createView(tx, {
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
    await createAutomation(tx, { ...copy.automation, definition: welcome.definition });
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
  timeoutSeconds: 900,
  retry: { attempts: 3 },
  payload: z.object({ userId: z.string(), language: ExampleLanguage.default('en') }),
  async handle(job, tx) {
    const member = await memberOf(job.orgId, job.payload.userId);

    // Only for an owner still with the organisation.
    if (member?.role !== 'owner') return;

    await runAs(member, () => seedExampleData(tx, job.payload.language));
  },
});
