-- The vault guard, run by tools/check-rls.sh on a freshly migrated database.
-- Every row it returns is a problem; no rows means the schema passes.
-- Every column that points at core_secrets has the core_drop_secrets trigger for delete and for
-- update of that column, so a secret goes when the row that keeps its id does. Only the vault
-- can seal (lint, tools/config/restricted.ts), so no other column holds a sealed value.
with references_to_vault as (
  select co.conrelid, co.conrelid::regclass::text as table_name, a.attname as column_name
  from pg_constraint co
  join pg_attribute a on a.attrelid = co.conrelid and a.attnum = any (co.conkey)
  where co.contype = 'f' and co.confrelid = to_regclass('public.core_secrets')
),
drop_triggers as (
  select t.tgrelid, t.tgtype, t.tgattr,
    array_remove(string_to_array(encode(t.tgargs, 'escape'), '\000'), '') as columns
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  where p.proname = 'core_drop_secrets' and not t.tgisinternal
)
select format('%s.%s points at core_secrets without a core_drop_secrets trigger for delete and for update of it',
  r.table_name, r.column_name)
from references_to_vault r
where not exists (
  select 1
  from drop_triggers t
  join pg_attribute a on a.attrelid = t.tgrelid and a.attname = r.column_name
  where t.tgrelid = r.conrelid
    and r.column_name = any (t.columns)
    -- Row level, after, on delete (8) and on update (16).
    and t.tgtype & 1 = 1 and t.tgtype & 2 = 0 and t.tgtype & 8 = 8 and t.tgtype & 16 = 16
    and a.attnum = any (t.tgattr::int2[])
)
order by 1;
