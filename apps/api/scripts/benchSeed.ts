/** `rows` customers with properties, tags, owners and activity, and a company for every twenty. */
const contactsSql = (orgId: string, rows: number) => {
  const companies = Math.max(1, Math.floor(rows / 20));

  return `
    INSERT INTO core_fields (id, org_id, content_type, label, type, options, "order")
    VALUES ('f_spend', '${orgId}', 'customer', 'Spend', 'number', '{}', 1),
           ('f_tier', '${orgId}', 'customer', 'Tier', 'select', '{bronze,silver,gold}', 2),
           ('f_interests', '${orgId}', 'customer', 'Interests', 'multiselect', '{golf,ski,music,food}', 3),
           ('f_renewal', '${orgId}', 'customer', 'Renewal', 'date', '{}', 4);
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
    INSERT INTO core_customer_field_values (org_id, record_id, field_id, number_value)
      SELECT '${orgId}', 'c' || g, 'f_spend', (g * 37) % 10000 FROM generate_series(1, ${rows}) g;
    INSERT INTO core_customer_field_values (org_id, record_id, field_id, text_value)
      SELECT '${orgId}', 'c' || g, 'f_tier', (ARRAY['bronze','silver','gold'])[g % 3 + 1] FROM generate_series(1, ${rows}) g;
    INSERT INTO core_customer_field_values (org_id, record_id, field_id, position, text_value)
      SELECT '${orgId}', 'c' || g, 'f_interests', p - 1, (CASE WHEN g % 4 = 0 THEN ARRAY['golf','music'] ELSE ARRAY['food'] END)[p]
      FROM generate_series(1, ${rows}) g, generate_series(1, 2) p WHERE p = 1 OR g % 4 = 0;
    INSERT INTO core_customer_field_values (org_id, record_id, field_id, date_value)
      SELECT '${orgId}', 'c' || g, 'f_renewal', current_date + (g % 400) - 200 FROM generate_series(1, ${rows}) g;
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
    INSERT INTO core_fields (id, org_id, content_type, label, type, options, "order")
    VALUES ('f_region', '${orgId}', 'company', 'Region', 'select', '{north,south,east,west}', 1);
    INSERT INTO core_company_field_values (org_id, record_id, field_id, text_value)
      SELECT '${orgId}', 'co' || g, 'f_region', (ARRAY['north','south','east','west'])[g % 4 + 1] FROM generate_series(1, ${companies}) g;
  `;
};

/**
 * A product for every ten customers; customer `c1`'s long timeline with notes, written by
 * `user1`, and every member's edits; the owner's inbox of notifications; an audit entry per two
 * customers.
 */
const recordsSql = (orgId: string, ownerId: string, rows: number) => {
  const products = Math.max(1, Math.floor(rows / 10));
  const audit = Math.max(1, Math.floor(rows / 2));
  const timeline = 5000;
  const inbox = 20_000;

  return `
    INSERT INTO core_products (id, org_id, kind, name, code, currency, price, created_at, updated_at)
      SELECT 'pr' || g, '${orgId}', CASE WHEN g % 5 = 0 THEN 'service' ELSE 'goods' END,
        'Product ' || substr(md5(g::text), 1, 8), 'P' || g, 'MNT', g * 100,
        now() - make_interval(mins => g), now()
      FROM generate_series(1, ${products}) g;
    INSERT INTO core_activities (id, org_id, target_type, target_id, source, type, summary, actor_type, actor_id, occurred_at, created_at)
      SELECT 't' || g, '${orgId}', 'customer', 'c1', 'core', 'customer.note', NULL, 'user', 'user1',
        now() - make_interval(mins => g * 7), now() - make_interval(mins => g * 7)
      FROM generate_series(1, ${timeline}) g;
    INSERT INTO core_notes (id, org_id, body)
      SELECT 't' || g, '${orgId}', 'Called about order ' || g FROM generate_series(1, ${timeline}) g WHERE g % 2 = 0;
    INSERT INTO core_activities (id, org_id, target_type, target_id, source, type, actor_type, actor_id, occurred_at, created_at)
      SELECT 'u' || g, '${orgId}', 'customer', 'c' || (g * 17 % ${rows} + 1), 'core', 'customer.updated', 'user', 'user' || (g % 20 + 1),
        now() - make_interval(mins => g * 3), now() - make_interval(mins => g * 3)
      FROM generate_series(1, ${rows}) g;
    INSERT INTO core_notifications (id, org_id, user_id, source, kind, title, actor_type, read_at, created_at)
      SELECT 'n' || g, '${orgId}', CASE WHEN g % 4 = 0 THEN '${ownerId}' ELSE 'user' || (g % 20 + 1) END,
        CASE WHEN g % 10 = 0 THEN 'sales' ELSE 'core' END, 'core.note.mentioned', 'Mentioned ' || g, 'system',
        CASE WHEN g % 3 = 0 THEN NULL ELSE now() END, now() - make_interval(mins => g)
      FROM generate_series(1, ${inbox * 4}) g;
    INSERT INTO core_audit_logs (id, org_id, actor_type, actor_id, action, target_type, target_id, target_label, created_at)
      SELECT 'al' || g, '${orgId}', 'user', 'user' || (g % 20 + 1),
        (ARRAY['customer.updated','customer.created','company.updated','tag.created'])[g % 4 + 1],
        'customer', 'c' || g, 'Customer ' || g, now() - make_interval(mins => ${audit} - g)
      FROM generate_series(1, ${audit}) g;
  `;
};

/**
 * The bench organisation's records in plain SQL (run as the owner, without row level security).
 * Vacuum after it (`VACUUM (ANALYZE)`, a statement of its own): a bulk load leaves trigram
 * indexes' new entries in their pending lists and the visibility map empty, which autovacuum
 * has long cleared on a real organisation.
 */
export const seedSql = (orgId: string, ownerId: string, rows: number) =>
  `${contactsSql(orgId, rows)}${recordsSql(orgId, ownerId, rows)}`;
