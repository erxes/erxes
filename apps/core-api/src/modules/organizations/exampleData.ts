import { companies, customers, type Db, leadStages, roles, users } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { lockOrganization } from '~/lib/locks';
import type { JobDefinition } from '~/modules/jobs/jobs';
import { addNote } from '~/modules/activities/activities.service';
import { createAutomation } from '~/modules/automations/automations.service';
import { AUTOMATION_TEMPLATES } from '~/modules/automations/library';
import { createCompany } from '~/modules/companies/companies.service';
import { createCustomer, linkCustomerCompany } from '~/modules/customers/customers.service';
import { createField } from '~/modules/fields/fields.service';
import { createTag } from '~/modules/tags/tags.service';
import { createView } from '~/modules/views/views.service';

/**
 * Example data for a fresh organisation, so its first look isn't empty (as
 * HubSpot and Attio do): companies, customers and leads across the lead
 * stages, linked with roles, tags, two custom fields, timeline notes, a saved
 * view and a welcome automation left off. Everything is tagged "Example", so
 * it can be filtered and deleted in one go. Emails are `@example.com` (never
 * delivered). Written through the services, so timelines, search and events
 * are what real records get.
 */

export type ExampleLanguage = 'en' | 'mn';

interface Person {
  first: string;
  last: string;
  email: string;
  phone: string;
  position: string;
  /** A customer, or a lead at stage N (0 = the first open one). */
  stage?: number;
  company?: number;
  role?: string;
  mainContact?: boolean;
  vip?: boolean;
  plan?: number;
  renewalInDays?: number;
  birthDate?: string;
  source?: string;
  /** Why a disqualified lead was let go. */
  reason?: string;
  note?: string;
}

interface Copy {
  tags: { example: string; vip: string; partner: string };
  plan: { label: string; options: string[] };
  renewal: string;
  vipView: string;
  automation: { name: string; description: string };
  companies: { name: string; industry: string; website: string; size: number; partner?: boolean }[];
  people: Person[];
}

const COPY: Record<ExampleLanguage, Copy> = {
  en: {
    tags: { example: 'Example', vip: 'VIP', partner: 'Partner' },
    plan: { label: 'Plan', options: ['Free', 'Pro', 'Enterprise'] },
    renewal: 'Renewal date',
    vipView: 'VIP customers',
    automation: {
      name: 'Welcome new customers (example)',
      description:
        'Emails every new customer, then tells their owner. Turn it on when you are ready.',
    },
    companies: [
      {
        name: 'Northwind Traders',
        industry: 'Retail',
        website: 'https://northwind.example.com',
        size: 120,
        partner: true,
      },
      {
        name: 'Blue Sky Travel',
        industry: 'Travel',
        website: 'https://bluesky.example.com',
        size: 35,
      },
      {
        name: 'Steppe Logistics',
        industry: 'Logistics',
        website: 'https://steppe.example.com',
        size: 260,
      },
      { name: 'Acme Studio', industry: 'Design', website: 'https://acme.example.com', size: 12 },
    ],
    people: [
      {
        first: 'Olivia',
        last: 'Bennett',
        email: 'olivia.bennett@example.com',
        phone: '+1 555 0101',
        position: 'Head of purchasing',
        company: 0,
        role: 'Decision maker',
        mainContact: true,
        vip: true,
        plan: 2,
        renewalInDays: 40,
        birthDate: '1988-03-14',
        note: 'Renewal call booked for next month. Wants the yearly plan with two more seats.',
      },
      {
        first: 'Liam',
        last: 'Carter',
        email: 'liam.carter@example.com',
        phone: '+1 555 0102',
        position: 'Store manager',
        company: 0,
        role: 'User',
        plan: 2,
      },
      {
        first: 'Sofia',
        last: 'Diaz',
        email: 'sofia.diaz@example.com',
        phone: '+1 555 0103',
        position: 'Founder',
        company: 1,
        role: 'Owner',
        mainContact: true,
        vip: true,
        plan: 1,
        renewalInDays: 12,
        note: 'Happy with the service; asked about a referral discount.',
      },
      {
        first: 'Noah',
        last: 'Evans',
        email: 'noah.evans@example.com',
        phone: '+1 555 0104',
        position: 'Operations lead',
        company: 2,
        role: 'Champion',
        mainContact: true,
        plan: 1,
        renewalInDays: 90,
      },
      {
        first: 'Emma',
        last: 'Fischer',
        email: 'emma.fischer@example.com',
        phone: '+1 555 0105',
        position: 'Designer',
        company: 3,
        role: 'User',
        plan: 0,
      },
      {
        first: 'Mason',
        last: 'Garcia',
        email: 'mason.garcia@example.com',
        phone: '+1 555 0106',
        position: 'CTO',
        company: 2,
        role: 'Evaluator',
        stage: 0,
        source: 'website',
        note: 'Signed up for the newsletter from the pricing page.',
      },
      {
        first: 'Ava',
        last: 'Hughes',
        email: 'ava.hughes@example.com',
        phone: '+1 555 0107',
        position: 'Marketing manager',
        stage: 1,
        source: 'referral',
      },
      {
        first: 'Lucas',
        last: 'Ito',
        email: 'lucas.ito@example.com',
        phone: '+1 555 0108',
        position: 'Procurement',
        company: 3,
        role: 'Decision maker',
        stage: 2,
        source: 'event',
        note: 'Met at the trade fair. Needs a quote for 10 seats by Friday.',
      },
      {
        first: 'Mia',
        last: 'Jensen',
        email: 'mia.jensen@example.com',
        phone: '+1 555 0109',
        position: 'Owner',
        stage: 3,
        source: 'ads',
      },
      {
        first: 'Ethan',
        last: 'Klein',
        email: 'ethan.klein@example.com',
        phone: '+1 555 0110',
        position: 'Student',
        stage: 4,
        source: 'website',
        reason: 'No budget this year',
      },
    ],
  },
  mn: {
    tags: { example: 'Жишээ', vip: 'VIP', partner: 'Түнш' },
    plan: { label: 'Багц', options: ['Үнэгүй', 'Про', 'Байгууллага'] },
    renewal: 'Сунгах огноо',
    vipView: 'VIP харилцагчид',
    automation: {
      name: 'Шинэ харилцагчийг угтах (жишээ)',
      description:
        'Шинэ харилцагч бүрт имэйл илгээж, хариуцагчид нь мэдэгдэнэ. Бэлэн болохоороо асаагаарай.',
    },
    companies: [
      {
        name: 'Хангай Трейд ХХК',
        industry: 'Жижиглэн худалдаа',
        website: 'https://khangai.example.com',
        size: 120,
        partner: true,
      },
      {
        name: 'Цэнхэр Тэнгэр Аялал',
        industry: 'Аялал жуулчлал',
        website: 'https://tenger.example.com',
        size: 35,
      },
      {
        name: 'Тал Ложистик ХХК',
        industry: 'Тээвэр логистик',
        website: 'https://tal.example.com',
        size: 260,
      },
      { name: 'Акме Студио', industry: 'Дизайн', website: 'https://acme.example.com', size: 12 },
    ],
    people: [
      {
        first: 'Сарангэрэл',
        last: 'Бат',
        email: 'sarangerel@example.com',
        phone: '88001101',
        position: 'Худалдан авалтын менежер',
        company: 0,
        role: 'Шийдвэр гаргагч',
        mainContact: true,
        vip: true,
        plan: 2,
        renewalInDays: 40,
        birthDate: '1988-03-14',
        note: 'Сунгалтын уулзалт ирэх сард. Жилийн багцыг 2 нэмэлт хэрэглэгчтэй авах сонирхолтой.',
      },
      {
        first: 'Тэмүүлэн',
        last: 'Ганбаатар',
        email: 'temuulen@example.com',
        phone: '88001102',
        position: 'Дэлгүүрийн менежер',
        company: 0,
        role: 'Хэрэглэгч',
        plan: 2,
      },
      {
        first: 'Оюунчимэг',
        last: 'Төмөр',
        email: 'oyunchimeg@example.com',
        phone: '88001103',
        position: 'Үүсгэн байгуулагч',
        company: 1,
        role: 'Эзэмшигч',
        mainContact: true,
        vip: true,
        plan: 1,
        renewalInDays: 12,
        note: 'Үйлчилгээнд сэтгэл хангалуун. Санал болголтын хөнгөлөлтийн талаар асуусан.',
      },
      {
        first: 'Бат-Эрдэнэ',
        last: 'Дорж',
        email: 'baterdene@example.com',
        phone: '88001104',
        position: 'Үйл ажиллагаа хариуцсан',
        company: 2,
        role: 'Дэмжигч',
        mainContact: true,
        plan: 1,
        renewalInDays: 90,
      },
      {
        first: 'Энхжин',
        last: 'Болд',
        email: 'enkhjin@example.com',
        phone: '88001105',
        position: 'Дизайнер',
        company: 3,
        role: 'Хэрэглэгч',
        plan: 0,
      },
      {
        first: 'Мөнх-Эрдэнэ',
        last: 'Сүх',
        email: 'munkherdene@example.com',
        phone: '88001106',
        position: 'Технологийн захирал',
        company: 2,
        role: 'Үнэлэгч',
        stage: 0,
        source: 'website',
        note: 'Үнийн хуудаснаас мэдээллийн товхимолд бүртгүүлсэн.',
      },
      {
        first: 'Анужин',
        last: 'Ганзориг',
        email: 'anujin@example.com',
        phone: '88001107',
        position: 'Маркетингийн менежер',
        stage: 1,
        source: 'referral',
      },
      {
        first: 'Билгүүн',
        last: 'Цэрэн',
        email: 'bilguun@example.com',
        phone: '88001108',
        position: 'Худалдан авалт',
        company: 3,
        role: 'Шийдвэр гаргагч',
        stage: 2,
        source: 'event',
        note: 'Үзэсгэлэн дээр уулзсан. Баасан гараг гэхэд 10 хэрэглэгчийн үнийн санал хүсэж байна.',
      },
      {
        first: 'Номин-Эрдэнэ',
        last: 'Пүрэв',
        email: 'nominerdene@example.com',
        phone: '88001109',
        position: 'Эзэмшигч',
        stage: 3,
        source: 'ads',
      },
      {
        first: 'Хулан',
        last: 'Отгон',
        email: 'khulan@example.com',
        phone: '88001110',
        position: 'Оюутан',
        stage: 4,
        source: 'website',
        reason: 'Энэ жил төсөвгүй',
      },
    ],
  },
};

const isoDay = (days: number) => {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

/**
 * Seeds the example data, once: only while the organisation has no customers
 * and no companies (the organisation row is locked, so two members finishing
 * the welcome steps at once can't both seed). Returns whether it did.
 */
export const seedExampleData = async (tx: Db, actor: Actor, language: ExampleLanguage) => {
  await lockOrganization(tx, actor.orgId);

  const [existing] = await tx
    .select({
      any: sql<boolean>`exists (select 1 from ${customers} where ${customers.orgId} = ${actor.orgId})
        or exists (select 1 from ${companies} where ${companies.orgId} = ${actor.orgId})`,
    })
    .from(sql`(select 1) as one`);

  if (existing?.any) return { seeded: false };

  const copy = COPY[language];

  const tag = async (type: 'customer' | 'company', name: string, colorCode: string) =>
    (await createTag(tx, actor, { type, name, colorCode })).id;

  const exampleCustomer = await tag('customer', copy.tags.example, '#94a3b8');
  const vip = await tag('customer', copy.tags.vip, '#f59e0b');
  const exampleCompany = await tag('company', copy.tags.example, '#94a3b8');
  const partner = await tag('company', copy.tags.partner, '#10b981');

  const plan = await createField(tx, actor, {
    contentType: 'customer',
    label: copy.plan.label,
    type: 'select',
    options: copy.plan.options,
  });

  const renewal = await createField(tx, actor, {
    contentType: 'customer',
    label: copy.renewal,
    type: 'date',
  });

  const companyIds: string[] = [];

  for (const company of copy.companies) {
    const created = await createCompany(tx, actor, {
      primaryName: company.name,
      industry: company.industry,
      website: company.website,
      size: company.size,
      ownerId: actor.userId,
      tagIds: company.partner ? [exampleCompany, partner] : [exampleCompany],
    });

    companyIds.push(created.id);
  }

  const stages = await tx
    .select({ id: leadStages.id })
    .from(leadStages)
    .where(and(eq(leadStages.orgId, actor.orgId)))
    .orderBy(asc(leadStages.order));

  for (const person of copy.people) {
    const lead = person.stage !== undefined && stages[person.stage];

    const created = await createCustomer(tx, actor, {
      firstName: person.first,
      lastName: person.last,
      primaryEmail: person.email,
      primaryPhone: person.phone,
      position: person.position,
      ownerId: actor.userId,
      ...(person.birthDate ? { birthDate: person.birthDate } : {}),
      tagIds: person.vip ? [exampleCustomer, vip] : [exampleCustomer],
      customFields: {
        ...(person.plan !== undefined ? { [plan.id]: copy.plan.options[person.plan]! } : {}),
        ...(person.renewalInDays !== undefined
          ? { [renewal.id]: isoDay(person.renewalInDays) }
          : {}),
      },
      ...(lead
        ? {
            state: 'lead' as const,
            leadStageId: lead.id,
            source: person.source ?? null,
            ...(person.reason ? { disqualifyReason: person.reason } : {}),
          }
        : { state: 'customer' as const }),
    });

    if (person.company !== undefined) {
      await linkCustomerCompany(tx, actor, created.id, companyIds[person.company]!, {
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
  }

  await createView(tx, actor, {
    recordType: 'customer',
    name: copy.vipView,
    shared: true,
    filter: { match: 'all', rules: [{ path: 'subject.tagIds', op: 'contains', value: vip }] },
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
export const exampleDataJob: JobDefinition = {
  queue: 'organization.example_data',
  atomic: true,
  leaseSeconds: 900,
  async handle(job, tx) {
    if (!tx) return;

    const userId = String(job.payload.userId ?? '');

    const [member] = await tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        permissions: roles.permissions,
      })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.orgId, job.orgId), eq(users.id, userId)))
      .limit(1);

    // Only for an owner still with the organisation.
    if (!member || member.status !== 'active' || member.role !== 'owner') return;

    await seedExampleData(
      tx,
      { userId: member.id, orgId: job.orgId, role: member.role, permissions: member.permissions },
      job.payload.language === 'mn' ? 'mn' : 'en',
    );
  },
};
