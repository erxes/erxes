/**
 * For plugin servers (`hr`, `ecom`, …):
 *
 *   const core = createCoreClient({ coreUrl, plugin: 'hr', clientSecret });
 *   await core.registerManifest({ title: 'HR', version: '1.0.0', scopes: ['notifications:write'] });
 *   await core.forOrg(orgId).notifications.create({ userIds, kind: 'hr.leave.requested', title });
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
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
 * Customers (a shop, tracking, booking): core signs them in; the plugin never builds sign-up or
 * sign-in. Declare `customerApp: { origins: ['https://{subdomain}.shop.example.com'] }` in the
 * manifest. The app's own form makes two calls to core: `POST /core/v1/customer-auth/code`
 * `{ clientId, kind, value }` sends a code, `POST /core/v1/customer-auth/sign-in` with the code
 * returns `{ accessToken, refreshToken, expiresIn, customer }`; `/customer-auth/refresh` renews
 * them. Serve customers under `/customer/*`, keyed by the customer id:
 *
 *   app.use('/customer', async (req, res, next) => {
 *     req.customer = await verifyCustomerToken(req.headers.authorization, { coreUrl })
 *       .catch(() => null);                // { orgId, customerId, clientId }
 *     return req.customer ? next() : res.sendStatus(401);
 *   });
 *   app.get('/customer/orders', (req) => orders.list(req.customer.orgId, req.customer.customerId));
 *
 * Tiers on SaaS (erxes.io: free / plus / pro; self-hosted: pro, full):
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *   if (member.tier === 'free' && employees >= 20) throw new Error('Upgrade to Plus for more employees');
 *   if (!member.canChange()) throw new Error('HR is read-only: buy it again on erxes.io');
 *   // server-side jobs: await core.forOrg(orgId).saas.pluginPlan() → { tier, access }
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
 * `employee`, `customer` or `website` for routes those call), and Settings › Developer shows them:
 *
 *   api: { url: `${publicUrl}/api`, docs: [{ audience: 'member', path: '/openapi/member.json' }] },
 *   app.use('/api/v1', member check, (req, res, next) => rest.handle(req, res, { prefix: '/api/v1', context }));
 *   app.get('/api/openapi/member.json', async (_req, res) => res.json(await pluginOpenApi(router, { plugin, audience: 'member', title, version, prefix: '/v1' })));
 *
 * The client secret is only ever sent to `POST /plugins/token`; API calls use
 * 15-minute tokens, fetched and renewed here. Plugins on core's database can
 * also call `core_publish_event()`, `core_record_audit()` and
 * `core_live_signal()` inside their own transactions.
 */

export * from './client';

export * from './jobs';

export * from './verify';
