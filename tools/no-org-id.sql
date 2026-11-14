-- Core's tables without org_id, each with the reason; tools/check-rls.sql reads
-- them. A tenant_key names the column the table's core_tenant policy keys on.
insert into no_org_id (table_name, tenant_key, reason) values
  ('core_organizations', 'id', 'The organisations themselves: their policy keys on id.'),
  ('core_plugins', null, 'The deployment''s plugin registry. Installations per organisation are core_plugin_installations.'),
  ('core_used_tokens', null, 'Ids of used single-use sign-in links, unique across the deployment.'),
  ('core_rate_limits', null, 'Request counts per client address, shared by every replica, before any organisation is known.');
