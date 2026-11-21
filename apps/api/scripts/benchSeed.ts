import type { DataFieldOption } from '@erxes/core-db';
import type { createField } from '~/modules/dataExtensions/fields.service';

/**
 * The bench organisation's records in plain SQL (run as the owner, without row
 * level security): `rows` customers with Data Extensions values, tags, owners and
 * activity, and a company for every twenty of them. The fields (`BENCH_FIELDS`)
 * are made through the API first, so their tables and columns exist.
 */

const options = (...values: string[]): DataFieldOption[] =>
  values.map((value) => ({ value, label: value, color: 'gray' }));

/** The fields the bench filters by: customers' and companies'. */
export const BENCH_FIELDS: Parameters<typeof createField>[1][] = [
  { recordType: 'core.customer', key: 'spend', label: 'Spend', type: 'number' },
  {
    recordType: 'core.customer',
    key: 'tier',
    label: 'Tier',
    type: 'select',
    options: options('bronze', 'silver', 'gold'),
  },
  {
    recordType: 'core.customer',
    key: 'interests',
    label: 'Interests',
    type: 'multiSelect',
    options: options('golf', 'ski', 'music', 'food'),
  },
  { recordType: 'core.customer', key: 'renewal', label: 'Renewal', type: 'date' },
  {
    recordType: 'core.company',
    key: 'region',
    label: 'Region',
    type: 'select',
    options: options('north', 'south', 'east', 'west'),
  },
];

export const seedSql = (orgId: string, rows: number) => {
  const companies = Math.max(1, Math.floor(rows / 20));
  const schema = `"data_${orgId}"`;

  return `
    INSERT INTO core_tags (id, org_id, type, name)
      SELECT 'tag' || g, '${orgId}', 'customer', 'Tag ' || g FROM generate_series(1, 20) g;
    INSERT INTO core_users (id, org_id, email, role, status)
      SELECT 'user' || g, '${orgId}', 'user' || g || '@bench.mn', 'member', 'active' FROM generate_series(1, 20) g;
    INSERT INTO core_customers (id, org_id, state, first_name, last_name, primary_email, emails, primary_phone, phones, birth_date, owner_id, created_at, updated_at, last_activity_at)
      SELECT 'c' || g, '${orgId}',
        CASE WHEN g % 5 = 0 THEN 'lead' ELSE 'customer' END,
        'First' || substr(md5(g::text), 1, 6), 'Last' || substr(md5((g * 7)::text), 1, 6),
        'p' || g || '@' || substr(md5(g::text), 1, 5) || '.mn', ARRAY['p' || g || '@' || substr(md5(g::text), 1, 5) || '.mn'],
        (80000000 + g)::text, ARRAY[(80000000 + g)::text],
        date '1960-01-01' + (g % 16000),
        CASE WHEN g % 3 = 0 THEN 'user' || (g % 20 + 1) END,
        now() - make_interval(mins => g % (3 * 365 * 24 * 60)),
        now() - make_interval(mins => g % (365 * 24 * 60)),
        now() - make_interval(mins => g % (3 * 365 * 24 * 60))
      FROM generate_series(1, ${rows}) g;
    INSERT INTO ${schema}.ext_core_customer (record_id, org_id, spend, tier, interests, renewal)
      SELECT 'c' || g, '${orgId}', (g * 37) % 10000, (ARRAY['bronze','silver','gold'])[g % 3 + 1],
        CASE WHEN g % 4 = 0 THEN ARRAY['golf','music'] ELSE ARRAY['food'] END,
        current_date + (g % 400) - 200
      FROM generate_series(1, ${rows}) g;
    INSERT INTO core_customer_tags (org_id, customer_id, tag_id)
      SELECT '${orgId}', 'c' || g, 'tag' || (g % 20 + 1) FROM generate_series(1, ${rows}) g WHERE g % 3 = 0;
    INSERT INTO core_companies (id, org_id, primary_name, names, emails, phones, industry, created_at, updated_at)
      SELECT 'co' || g, '${orgId}', 'Company ' || g, ARRAY['Company ' || g], '{}', '{}',
        (ARRAY['Retail','Mining','Finance','Tech'])[g % 4 + 1], now(), now()
      FROM generate_series(1, ${companies}) g;
    INSERT INTO core_customer_companies (org_id, customer_id, company_id)
      SELECT '${orgId}', 'c' || g, 'co' || ((g / 2) % ${companies} + 1) FROM generate_series(1, ${rows}) g WHERE g % 2 = 0;
    INSERT INTO core_activities (id, org_id, target_type, target_id, source, type, actor_type, created_at)
      SELECT 'a' || g, '${orgId}', 'customer', 'c' || (g * 13 % ${rows} + 1), 'core', 'customer.note', 'system',
        now() - make_interval(hours => g % (2 * 365 * 24))
      FROM generate_series(1, ${rows}) g;
    INSERT INTO ${schema}.ext_core_company (record_id, org_id, region)
      SELECT 'co' || g, '${orgId}', (ARRAY['north','south','east','west'])[g % 4 + 1] FROM generate_series(1, ${companies}) g;
    ANALYZE;
  `;
};
