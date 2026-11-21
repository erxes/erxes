/**
 * For plugin servers (`hr`, `ecom`, …):
 *
 *   const core = createCoreClient({ coreUrl, plugin: 'hr', clientSecret });
 *   await core.registerManifest({ title: 'HR', version: '1.0.0', scopes: ['notifications:write'] });
 *   await core.forOrg(orgId).notifications.create({ userIds, kind: 'hr.leave.requested', title });
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *
 * In a procedure, pass core's refusals on (400 with the field, 404, 409) and only core being
 * unreachable as 503 SERVICE_UNAVAILABLE:
 *
 *   const customer = await core.forOrg(orgId).customers.get({ id }).catch(passCoreError('customers'));
 *
 * Words core shows for the plugin (its title, record types' titles, activity and timeline labels)
 * come in other languages from the manifest's `translations`, keyed by the English text; web shows
 * the member's language, else the English:
 *
 *   translations: { mn: { HR: 'Хүний нөөц', Employee: 'Ажилтан', 'Leave approved': 'Чөлөө зөвшөөрөгдсөн' } }
 *
 * Payments (scopes `payments:write`, `payments:read`; subscribe to `core.payment.*`):
 *
 *   const invoice = await core.forOrg(orgId).payments.createInvoice({
 *     amount: 150000, description: 'Order #12', referenceType: 'order', referenceId: order.id,
 *     metadata: { orderId: order.id }, dedupeKey: `order:${order.id}`,
 *   });                                   // show invoice.payment.qrImage / links to the payer
 *   app.post('/events', express.text({ type: '*\/*' }), async (req, res) => {
 *     const event = await verifyCoreEvent(req.headers.authorization, req.body, { coreUrl, plugin: 'ecom' });
 *     if (event.type === 'core.payment.paid') await markOrderPaid(event.data.payload.metadata.orderId);
 *     res.sendStatus(204);                // anything but 2xx is retried; handle each event id once
 *   });
 *   await core.forOrg(orgId).payments.refund({ id: invoice.id, reason: 'Out of stock' });
 *
 * Products (scopes `products:read`, `products:write`): one catalog per organisation, shared by plugins.
 * Prices are integers in the organisation's currency's smallest unit (`organizations.current()`).
 *
 *   const mine = await core.forOrg(orgId).products.list({});            // the ones this plugin uses
 *   const found = await core.forOrg(orgId).products.list({ search: 'phone', all: true });
 *   await core.forOrg(orgId).products.use({ ids: [found.data[0].id], used: true });
 *   // An invoice may list what it pays for; `plugin` names another plugin's line (it gets the events):
 *   //   lines: [{ productId, quantity: 1, unitPrice: 150000 }, { name: 'Delivery', quantity: 1, unitPrice: 10000, plugin: 'tms' }]
 *
 * Team members who don't sign in (scope `users:write`): people a plugin keeps on the team for its own app
 * (HR's employees). They take no seat and never sign in to erxes; a plugin adds them and changes
 * their profile, never a member who signs in.
 *
 *   const worker = await core.forOrg(orgId).users.add({ fullName, employeeId, phone });
 *
 * Branches and departments (scopes `units:read`, `units:write`; subscribe to `core.unit.*`): core's,
 * shared by plugins. Keep a read-only copy for your own visibility queries and refresh it whenever
 * a `core.unit.*` event arrives (the event names the unit in `entityId`); bring your old units in
 * once with `units.import`, which keeps their ids and answers where each one went. Each unit has a
 * `typeId`, one of the organisation's `unitTypes` of its kind (Branch and Department to start);
 * bring your own types first with `unitTypes.import` and name them on the units you import.
 *
 *   const { data } = await core.forOrg(orgId).units.list({});    // every unit, parents first, with memberIds
 *   const { ids } = await core.forOrg(orgId).units.import({ units: [{ id, kind: 'branch', name, memberIds }] });
 *
 * Exchange rates (scopes `exchange_rates:read`, `exchange_rates:write`): the ones members keep in
 * Settings › Exchange rates. A rate counts from its day until the pair's next one; `getActiveRate`
 * answers the rate in force on a day (a moment counts on its day in the organisation's time zone),
 * or null, with `mainCurrency` the organisation's currency unless given.
 *
 *   const spot = await core.forOrg(orgId).exchangeRates.getActiveRate({ date: tr.date.toISOString(), rateCurrency: 'USD' });
 *   const rate = spot?.rate ?? 0;                                   // 1 USD = rate MNT
 *
 * Fields on customers and companies (rollups; scope `fields:write`): declare them in the manifest,
 * then write their values. Members see them read-only and filter by them; no timeline entry or event.
 *
 *   fields: [{ code: 'total_spent', contentType: 'customer', label: 'Total spent', type: 'number' }],
 *   await core.forOrg(orgId).fields.setPluginValues({
 *     contentType: 'customer', values: [{ recordId: customerId, code: 'total_spent', value: 150000 }],
 *   });                                   // → { written, skipped }; up to 500, value null clears
 *
 * Segments (scope `views:read`): a shared view members built in core is the audience.
 *
 *   const { data } = await core.forOrg(orgId).views.list({ recordType: 'customer' });  // shared only
 *   const { recordIds } = await core.forOrg(orgId).views.matches({ viewId, recordIds: [customerId] });
 *
 * Customers (a shop, hotel or tour site): core signs them in, per website; the plugin never builds
 * sign-up or sign-in. Each record with a website (a store) saves it in core (scope
 * `websites:write`) and keeps the id: `await core.forOrg(orgId).websites.save({ recordId: store.id,
 * name: store.name, origins: ['https://shop.example.mn'] })` → `{ id, … }`; `websites.remove`
 * when the record goes. The website's own forms call core: `POST /core/v1/customer-auth/sign-up`
 * `{ website, kind, value, firstName, … }` then `/sign-up/confirm` with the emailed code makes the
 * account; `POST /core/v1/customer-auth/code` `{ website, kind, value }` then `/sign-in` with the
 * code signs an account in. Both return `{ accessToken, refreshToken, expiresIn, customer }`;
 * `/customer-auth/refresh` renews them.
 * Serve customers under `/customer/*`, keyed by the customer id and scoped to the website:
 *
 *   app.use('/customer', async (req, res, next) => {
 *     req.customer = await verifyCustomerToken(req.headers.authorization, { coreUrl })
 *       .catch(() => null);                // { orgId, customerId, websiteId }
 *     req.store = req.customer && (await storeOfWebsite(req.customer.orgId, req.customer.websiteId));
 *     return req.store ? next() : res.sendStatus(401);
 *   });
 *   app.get('/customer/orders', (req) => orders.list(req.store.id, req.customer.customerId));
 *
 * Tiers on SaaS (erxes.io: free / plus / pro; self-hosted: pro, full):
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *   if (member.tier === 'free' && employees >= 20) throw new Error('Upgrade to Plus for more employees');
 *   if (!member.canChange()) throw new Error('HR is read-only: buy it again on erxes.io');
 *   // member.bundles: the bundle codes live on Stripe, one per bundle bought (self-hosted: [])
 *   // server-side jobs: await core.forOrg(orgId).saas.pluginPlan() → { saas, tier, access, bundles }
 *
 * Jobs (plugins on core's database): declare them in the manifest, queue them in the
 * plugin's own transaction, and serve each at `<api.url>/jobs/<name>`. Core retries
 * until the route answers 2xx (`retry`: attempts in all, the first wait and the
 * longest, in seconds; default 8, 30 s, 6 h). A `cron` (UTC) job runs once per
 * organisation that has the plugin.
 *
 *   jobs: [{ name: 'mail.sync', retry: { attempts: 5, delay: 60, maxDelay: 3600 } },
 *          { name: 'sla.check', cron: '*\/5 * * * *' }],
 *   await enqueueJob(tx, { orgId, name: 'mail.sync', payload: { accountId }, dedupeKey: accountId });
 *   app.post('/api/jobs/:name', express.text({ type: '*\/*' }), async (req, res) => {
 *     const job = await verifyCoreJob(req.headers.authorization, req.body, { coreUrl, plugin: 'frontline' });
 *     await JOBS[job.name](job);         // { jobId, orgId, name, attempt, payload }; may repeat
 *     res.sendStatus(204);
 *   });
 *
 * Integrations (Facebook, Instagram): declare them in the manifest, each with one of its own
 * permissions, and core lists them in Settings › Integrations next to its own, for members with
 * `integrations.manage` and that permission. Keep their keys with `secrets.save`; the UI config's
 * `integrations` give each its icon and tabs. Report where each stands after it changes:
 *
 *   integrations: [{ key: 'facebook', name: 'Facebook', summary: 'Messenger and page comments in the inbox',
 *     category: 'social', permission: 'frontline.integration.manage' }],
 *   await core.reportIntegration(orgId, 'facebook', 'connected', pages.length);  // or 'off', 'attention', 'not-set-up'
 *
 * A timeline whose records not every member may read declares `recordAccess: true`; core asks the
 * plugin before a member reads or notes on one, and anything but `{ allowed: true }` within 5 s is no:
 *
 *   timelines: [{ type: 'frontline.ticket', label: 'Ticket', recordAccess: true }],
 *   app.post('/api/timelines/access', express.text({ type: '*\/*' }), async (req, res) => {
 *     const check = await verifyCoreAccessCheck(req.headers.authorization, req.body, { coreUrl, plugin: 'frontline' });
 *     res.json({ allowed: await canRead(check.orgId, check.userId, check.id) });   // check.type too
 *   });
 *
 * Callers outside erxes (a webhook, a redirect after an app install) reach the plugin through
 * core, at `<coreUrl>/core/v1/plugins/<name>/public/<orgId>/<path>`, for a path under one of the
 * manifest's `publicPaths`. Core forwards them to `<api.url>/public/<path>` with a token naming
 * the organisation, and passes the answer's status, type and redirect back:
 *
 *   publicPaths: ['/github/webhook'],
 *   app.all('/api/public/*path', express.text({ type: '*\/*' }), async (req, res) => {
 *     const { orgId } = await verifyPublicCall(req.headers.authorization, req.body ?? '', { coreUrl, plugin: 'operation' });
 *     // anyone can call: check the sender's own signature (X-Hub-Signature-256) before acting
 *   });
 *
 * List filters (erxes-ui's `ListFilter`): `@erxes/plugin-sdk/filter` compiles the bar's condition
 * group to SQL on a map of paths to columns, with core's operators and its 400 `INVALID_FILTER`:
 *
 *   const FIELDS = { 'subject.name': { type: 'text', expr: tickets.name } } satisfies FilterFields;
 *   .where(compileFilter(FIELDS, input.filter, { me: member.userId }))   // filter: FilterParam
 *
 * API reference: `@erxes/plugin-sdk/openapi` documents the plugin's routes, served as REST beside
 * the RPC handler. The manifest's `api.docs` lists one document per audience (`member`, and
 * `employee`, `customer` or `website` for routes those call), and Settings › Developer shows them.
 * The assistant calls the `member` document's routes with the member's session token:
 *
 *   api: { url: `${publicUrl}/api`, docs: [{ audience: 'member', path: '/openapi/member.json' }] },
 *   app.use('/api/v1', member check, (req, res, next) => rest.handle(req, res, { prefix: '/api/v1', context }));
 *   app.get('/api/openapi/member.json', async (_req, res) => res.json(await pluginOpenApi(router, { plugin, audience: 'member', title, version, server: `${publicUrl}/api`, prefix: '/v1' })));
 *
 * Another plugin's API (accounting reading sales' deals when sales' events arrive, which carry
 * only ids and totals): name it in the manifest's `pluginReads`. Each organisation's owner
 * approves it like a new scope, and it works where both plugins are installed. Core issues a
 * 5-minute token for that plugin's API with the approved permissions its manifest declares:
 *
 *   pluginReads: [{ plugin: 'sales', permissions: ['sales.deal.view'], reason: 'Post deals to the ledger' }],
 *   const response = await core.fetchPlugin(orgId, 'sales', `/v1/deals/${dealId}`);  // <sales api.url>/v1/deals/…
 *   // a refused token throws PluginCallError: code READ_NOT_APPROVED, PLUGIN_NOT_INSTALLED, PLUGIN_UNREACHABLE, NOT_IN_PLAN
 *
 * The plugin being read accepts the token beside members' sessions on `/api/rpc/*` and
 * `/api/v1/*`, so its `reads(...)` procedures serve it as they are:
 *
 *   const options = { coreUrl, plugin: 'sales' };
 *   const member = await verifyPluginSession(token, options).catch(() => verifyPluginCall(token, options));
 *   // a call: userId 'plugin:accounting', plugin 'accounting', role 'plugin', can() only the approved permissions
 *
 * Import and export of the plugin's records (Contacts › Settings › Import & export): core keeps
 * the file, the mapping, the check, the jobs and the progress; the plugin answers pages. Each
 * permission must be one of the manifest's `permissions`.
 *
 *   transfer: [{ type: 'frontline:ticket', label: 'tickets',
 *     exportPermission: 'frontline.ticket.export', importPermission: 'frontline.ticket.import',
 *     columns: [{ key: 'name', label: 'Name', aliases: ['title'] },
 *               { key: 'createdAt', label: 'Created', importable: false }] }],
 *   app.post('/api/transfer/:kind', express.text({ type: '*\/*' }), async (req, res) => {
 *     const request = await verifyCoreTransfer(req.headers.authorization, req.body, { coreUrl, plugin: 'frontline' });
 *     if (request.kind === 'export')     // { rows: [{ name, createdAt }], cursor: null on the last page }
 *       return res.json(await tickets.page(request.userId, request.query, request.cursor, request.limit));
 *     // { rows: [{ rowNumber, action: 'create' | 'update' | 'skip' | 'error', recordId?, error? }] }
 *     res.json(await tickets.importRows(request.userId, request.rows, request.mode, request.dryRun));
 *   });
 *
 * The client secret is only ever sent to `POST /plugins/token`; API calls use
 * 15-minute tokens, fetched and renewed here. Plugins on core's database can
 * also call `core_publish_event()`, `core_record_audit()` and
 * `core_live_signal()` inside their own transactions.
 */

export * from './client';

export * from './jobs';

export { PluginCallError } from './pluginCalls';

export * from './verify';
