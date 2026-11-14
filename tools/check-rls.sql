-- The tenancy guard, run by tools/check-rls.sh on a freshly migrated database.
-- Every row it returns is a problem; no rows means the schema passes.
-- It checks one scope's database, core's or a plugin's: psql sets :scope (`core`,
-- or the plugin's name) and :policy, the tenant policy's name (core's tables
-- have core_tenant, core_enable_tenant_rls gives a plugin's tables `tenant`).
-- create-erxes copies this file into every plugin unchanged; what differs per
-- scope is in tools/no-org-id.sql next to it.
--
-- 1. A tenant table (one with org_id, or a listed one with a tenant key) has
--    row level security enabled and forced, and the :policy policy:
--    permissive, for all commands, USING and WITH CHECK
--    core_tenant_visible(<key>). Any other permissive policy would let more
--    rows through, so it fails too. This is what lets withOrg() isolate
--    organisations with no filter in the query.
-- 2. A table without org_id is in tools/no-org-id.sql, with the reason.
-- 3. Every table, index, sequence and view, and every table constraint,
--    starts with <scope>_: core and plugins share the database. Drizzle's
--    migration log is __drizzle_migrations_<scope>.
-- 4. The core_queue schema is pg-boss's (core's modules/jobs), outside these
--    checks: its tables have no row level security, a job carries its
--    organisation in its data, and failed jobs are read by the scope's
--    organisation. So no plugin role and not PUBLIC may use it; plugins queue
--    work through core_events and its insert trigger.
create temp table no_org_id (table_name text primary key, tenant_key text, reason text not null);
insert into no_org_id values (format('__drizzle_migrations_%s', :'scope'), null, 'The migration log.');
\ir no-org-id.sql

with relations as (
  select c.oid, n.nspname, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname not in ('pg_catalog', 'information_schema', 'core_queue')
    and n.nspname not like 'pg\_toast%' and n.nspname not like 'pg\_temp%'
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
    p.policyname = :'policy' and p.cmd = 'ALL'
      and p.qual = format('core_tenant_visible(%s)', tt.key)
      and p.with_check = format('core_tenant_visible(%s)', tt.key) as is_tenant_policy
  from tenant_tables tt
  join pg_policies p on p.schemaname = tt.nspname and p.tablename = tt.relname
),
log (relname) as (
  select format('__drizzle_migrations_%s%s', :'scope', suffix) from unnest(array['', '_pkey', '_id_seq']) as suffix
)
select format('%s: %s', relname, concat_ws(', ',
  case when not relrowsecurity then 'row level security is off' end,
  case when not relforcerowsecurity then 'row level security is not forced' end,
  case when not exists (select 1 from policies p where p.oid = tt.oid and p.permissive and p.is_tenant_policy)
    then format('no %s policy on core_tenant_visible(%s)', :'policy', key) end))
from tenant_tables tt
where not (relrowsecurity and relforcerowsecurity
  and exists (select 1 from policies p where p.oid = tt.oid and p.permissive and p.is_tenant_policy))
union all
select format('%s: permissive policy %s is not the %s check, so it lets more rows through', tt.relname, p.policyname, :'policy')
from tenant_tables tt
join policies p on p.oid = tt.oid
where p.permissive and not p.is_tenant_policy
union all
select format('%s has no org_id: add it, or list the table in tools/no-org-id.sql with the reason', relname)
from tables
where not has_org_id and not listed
union all
select format('tools/no-org-id.sql lists %s, which %s', l.table_name,
  case when t.relname is null then 'does not exist' else 'has org_id' end)
from no_org_id l
left join tables t on t.nspname = 'public' and t.relname = l.table_name
where t.relname is null or t.has_org_id
union all
select format('%s %s does not start with %s_',
  case relkind when 'i' then 'index' when 'I' then 'index' when 'S' then 'sequence' when 'v' then 'view'
    when 'm' then 'materialized view' else 'table' end, relname, :'scope')
from relations
where relkind in ('r', 'p', 'i', 'I', 'S', 'v', 'm', 'f')
  and not starts_with(relname, :'scope' || '_')
  and relname not in (select relname from log)
union all
select format('constraint %s on %s does not start with %s_', co.conname, co.conrelid::regclass, :'scope')
from pg_constraint co
join relations r on r.oid = co.conrelid
where not starts_with(co.conname, :'scope' || '_')
  and co.conrelid is distinct from to_regclass(format('public.__drizzle_migrations_%s', :'scope'))
union all
-- The oid forms return null when the schema doesn't exist, as in a plugin's own database.
select format('%s may use schema core_queue (the job queue): only the API''s roles may', grantee)
from (
  select 'PUBLIC' as grantee where has_schema_privilege('public', to_regnamespace('core_queue')::oid, 'USAGE')
  union all
  select rolname from pg_roles
  where rolname like 'erxes\_plugin\_%' and has_schema_privilege(oid, to_regnamespace('core_queue')::oid, 'USAGE')
) as users
order by 1;
