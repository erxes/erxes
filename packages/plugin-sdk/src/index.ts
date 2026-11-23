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
 * Product stock by branch and department (write with scope `inventories:write`, read with
 * `products:read`): 3.x's `product.inventories`, kept by the plugin that books the stock. Each call
 * writes one place, `branchId` and `departmentId` either left out for none, at most 1000 lines.
 * `set` sets each amount (left out or 0 clears it, as 3.x unset it); `increase` adds each diff in
 * one statement, so concurrent bookings each add theirs. An unknown product fails the call (400
 * INVALID_PRODUCT). `remainders` is 3.x's `product.remainder`, `stock` the total and per-branch
 * stock without cost, and `products.list` filters by `minRemainder`/`maxRemainder`.
 *
 *   await core.forOrg(orgId).productInventories.increase({ branchId, departmentId, items: [{ productId, diffCount: -2, diffCost: -15000 }] });
 *   await core.forOrg(orgId).productInventories.set({ branchId, departmentId, items: [{ productId, remainder: 10, cost: 75000 }] });
 *   const { data } = await core.forOrg(orgId).productInventories.list({ productIds: ids.join(','), branchId, departmentId });
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
 * With the organisation's team member restrictions on (Settings › General, 3.x's "With team member
 * restrictions"), keep a member's lists to the units `units.restrictions` answers; null is no limit.
 *
 *   const { branchIds, departmentIds } = await core.forOrg(orgId).units.restrictions({ userId });
 *   if (branchIds) where.push(inArray(transactions.branchId, branchIds));
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
 * Email and texts go out through core, never the plugin's own SMTP or SMS provider:
 *
 *   await core.forOrg(orgId).emails.send({ to: [email], subject, body });   // scope emails:write
 *   await core.forOrg(orgId).sms.send({ to: [phone], text });               // scope sms:write
 *
 * The organisation's connections of core's integrations (Facebook): name them in the manifest
 * (`connections: [{ integration: 'facebook', reason }]`), the owner approves, then
 *
 *   const { data } = await core.forOrg(orgId).integrations.usable({ key: 'facebook' });
 *   const { accessToken, appSecret } = await core.forOrg(orgId).integrations.credentials({ id });
 *
 * and call the service yourself; its webhooks reach the plugin directly. Subscribe to
 * `core.integration.changed` to read a connection again when it changes or goes.
 *
 * Segments (scope `views:read`): a shared view members built in core is the audience.
 *
 *   const { data } = await core.forOrg(orgId).views.list({ recordType: 'customer' });  // shared only
 *   const { recordIds } = await core.forOrg(orgId).views.matches({ viewId, recordIds: [customerId] });
 *
 * Customers (a shop, hotel or tour site and its apps): core signs them in, per portal; the plugin
 * never builds sign-up or sign-in. A portal belongs to the organisation (Settings › Portals) and
 * many plugins attach to one, each with its own record (scope `portals:write`):
 * `await core.forOrg(orgId).portals.attach({ id: portalId, recordId: store.id })` puts a store on
 * a portal picked from `portals.list()`; `portals.save({ recordId: site.id, name, origins })`
 * makes the portal a record runs and renames it after; `portals.detach({ recordId })` when the
 * record goes. The portal's own forms call core: `POST /core/v1/customer-auth/sign-up`
 * `{ portal, kind, value, firstName, … }` then `/sign-up/confirm` with the code makes the
 * account; `POST /core/v1/customer-auth/code` `{ portal, kind, value }` then `/sign-in` with the
 * code signs an account in; `/customer-auth/social` signs in with Google, Apple or Facebook. They
 * return `{ accessToken, refreshToken, expiresIn, customer }`; `/customer-auth/refresh` renews them.
 * A portal's apps and server call each plugin's one portal API, `/portal/v1`, with
 * `X-Portal-Token`: a token core gives for one of the portal's customer keys, a secret key on its
 * server or a publishable key in its web and mobile apps; no plugin issues its own keys. A
 * signed-in customer adds `Authorization: Bearer`, which the `/me/*` routes (their orders, their
 * profile) require. `verifyPortalRequest` checks both, the browser's address and whom to limit:
 *
 *   app.use('/portal/v1', cors({ origin: true }), async (req, res, next) => {
 *     try {
 *       req.call = await verifyPortalRequest({
 *         portalToken: req.header('x-portal-token'), authorization: req.header('authorization'),
 *         origin: req.header('origin'), ip: req.ip, visitorIp: req.header('x-visitor-ip'),
 *       }, { coreUrl });                           // limit calls by req.call.visitor
 *     } catch (error) {
 *       if (!(error instanceof PortalRequestError)) return next(error);
 *       return res.status(error.status).json({ code: error.code, message: error.message });
 *     }
 *     req.store = await storeOfPortal(req.call.orgId, req.call.portalId);
 *     return req.store ? next() : res.sendStatus(401);
 *   });
 *   app.get('/portal/v1/me/orders', (req) => orders.list(req.store.id, req.call.customer.customerId));
 *
 * Files that need no token at all (product images) go under `/public`.
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
 * `employee`, `customer` or `portal` for routes those call), and Settings › Developer shows them.
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

export * from './portal';

export * from './verify';
