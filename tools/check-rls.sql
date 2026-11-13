-- The tenancy guard, run by tools/check-rls.sh on a freshly migrated database.
-- Every row it returns is a problem; no rows means the schema passes.
--
-- 1. A table with org_id has row level security enabled and forced, and a
--    policy, so withOrg() isolates organisations with no filter in the query.
--    So does any other table with row level security on (core_organizations).
-- 2. A table without org_id is in no_org_id, with the reason it holds no
--    organisation's rows.
-- 3. Every table, index, sequence, view and constraint starts with core_:
--    plugins share the database. Drizzle's migration log keeps the name
--    packages/db/drizzle.config.ts gives it.
with no_org_id (table_name, reason) as (
  values
    ('core_organizations', 'The organisations themselves. Their own policy keys on id (0012_tenant_isolation.sql).'),
    ('core_plugins', 'The deployment''s plugin registry. Installations per organisation are core_plugin_installations.'),
    ('core_event_consumers', 'Each stream consumer''s read position. A consumer reads every organisation''s events.'),
    ('core_used_tokens', 'Ids of used single-use sign-in links, unique across the deployment.'),
    ('__drizzle_migrations_core', 'The migration log.')
),
relations as (
  select c.oid, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname not in ('pg_catalog', 'information_schema') and n.nspname not like 'pg\_toast%'
),
tables as (
  select r.*,
    exists (
      select 1 from pg_attribute a where a.attrelid = r.oid and a.attname = 'org_id' and not a.attisdropped
    ) as has_org_id,
    exists (select 1 from pg_policy p where p.polrelid = r.oid) as has_policy
  from relations r
  where r.relkind in ('r', 'p')
)
select format('%s: %s', relname, concat_ws(', ',
  case when not relrowsecurity then 'row level security is off' end,
  case when not relforcerowsecurity then 'row level security is not forced' end,
  case when not has_policy then 'no policy' end))
from tables
where (has_org_id or relrowsecurity) and not (relrowsecurity and relforcerowsecurity and has_policy)
union all
select format('%s has no org_id: add it, or list the table in no_org_id with the reason', relname)
from tables
where not has_org_id and relname not in (select table_name from no_org_id)
union all
select format('no_org_id lists %s, which %s', l.table_name,
  case when t.relname is null then 'does not exist' else 'has org_id' end)
from no_org_id l
left join tables t on t.relname = l.table_name
where t.relname is null or t.has_org_id
union all
select format('%s %s does not start with core_',
  case relkind when 'i' then 'index' when 'I' then 'index' when 'S' then 'sequence' when 'v' then 'view'
    when 'm' then 'materialized view' else 'table' end, relname)
from relations
where relkind in ('r', 'p', 'i', 'I', 'S', 'v', 'm', 'f')
  and relname not like 'core\_%' and relname not like '\_\_drizzle\_migrations\_core%'
union all
select format('constraint %s on %s does not start with core_', co.conname, co.conrelid::regclass)
from pg_constraint co
join relations r on r.oid = co.conrelid
where co.conname not like 'core\_%' and co.conname not like '\_\_drizzle\_migrations\_core%'
order by 1;
