-- The tenancy guard, run by tools/check-rls.sh on a freshly migrated database.
-- Every row it returns is a problem; no rows means the schema passes.
--
-- 1. A tenant table (one with org_id, or a listed one with a tenant key) has
--    row level security enabled and forced, and the core_tenant policy:
--    permissive, for all commands, USING and WITH CHECK
--    core_tenant_visible(<key>). Any other permissive policy would let more
--    rows through, so it fails too. This is what lets withOrg() isolate
--    organisations with no filter in the query.
-- 2. A table without org_id is in no_org_id, with the reason.
-- 3. Every table, index, sequence and view, and every table constraint,
--    starts with core_: plugins share the database. Drizzle's migration log
--    keeps the name packages/db/drizzle.config.ts gives it.
with no_org_id (table_name, tenant_key, reason) as (
  values
    ('core_organizations', 'id', 'The organisations themselves: their policy keys on id.'),
    ('core_plugins', null, 'The deployment''s plugin registry. Installations per organisation are core_plugin_installations.'),
    ('core_event_consumers', null, 'Each stream consumer''s read position. A consumer reads every organisation''s events.'),
    ('core_used_tokens', null, 'Ids of used single-use sign-in links, unique across the deployment.'),
    ('__drizzle_migrations_core', null, 'The migration log.')
),
relations as (
  select c.oid, n.nspname, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname not in ('pg_catalog', 'information_schema') and n.nspname not like 'pg\_toast%'
),
tables as (
  select r.*,
    exists (
      select 1 from pg_attribute a where a.attrelid = r.oid and a.attname = 'org_id' and not a.attisdropped
    ) as has_org_id,
    l.table_name is not null as listed,
    l.tenant_key
  from relations r
  left join no_org_id l on r.nspname = 'public' and l.table_name = r.relname
  where r.relkind in ('r', 'p', 'f')
),
tenant_tables as (
  select t.*, case when t.has_org_id then 'org_id' else t.tenant_key end as key
  from tables t
  where t.has_org_id or t.tenant_key is not null
),
policies as (
  select tt.oid, p.policyname,
    p.permissive = 'PERMISSIVE' as permissive,
    p.policyname = 'core_tenant' and p.cmd = 'ALL'
      and p.qual = format('core_tenant_visible(%s)', tt.key)
      and p.with_check = format('core_tenant_visible(%s)', tt.key) as is_tenant_policy
  from tenant_tables tt
  join pg_policies p on p.schemaname = tt.nspname and p.tablename = tt.relname
)
select format('%s: %s', relname, concat_ws(', ',
  case when not relrowsecurity then 'row level security is off' end,
  case when not relforcerowsecurity then 'row level security is not forced' end,
  case when not exists (select 1 from policies p where p.oid = tt.oid and p.permissive and p.is_tenant_policy)
    then format('no core_tenant policy on core_tenant_visible(%s)', key) end))
from tenant_tables tt
where not (relrowsecurity and relforcerowsecurity
  and exists (select 1 from policies p where p.oid = tt.oid and p.permissive and p.is_tenant_policy))
union all
select format('%s: permissive policy %s is not the core_tenant check, so it lets more rows through', tt.relname, p.policyname)
from tenant_tables tt
join policies p on p.oid = tt.oid
where p.permissive and not p.is_tenant_policy
union all
select format('%s has no org_id: add it, or list the table in no_org_id with the reason', relname)
from tables
where not has_org_id and not listed
union all
select format('no_org_id lists %s, which %s', l.table_name,
  case when t.relname is null then 'does not exist' else 'has org_id' end)
from no_org_id l
left join tables t on t.nspname = 'public' and t.relname = l.table_name
where t.relname is null or t.has_org_id
union all
select format('%s %s does not start with core_',
  case relkind when 'i' then 'index' when 'I' then 'index' when 'S' then 'sequence' when 'v' then 'view'
    when 'm' then 'materialized view' else 'table' end, relname)
from relations
where relkind in ('r', 'p', 'i', 'I', 'S', 'v', 'm', 'f')
  and relname not like 'core\_%'
  and relname not in ('__drizzle_migrations_core', '__drizzle_migrations_core_pkey', '__drizzle_migrations_core_id_seq')
union all
select format('constraint %s on %s does not start with core_', co.conname, co.conrelid::regclass)
from pg_constraint co
join relations r on r.oid = co.conrelid
where co.conname not like 'core\_%' and co.conrelid is distinct from to_regclass('public.__drizzle_migrations_core')
order by 1;
