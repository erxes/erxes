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
 *     amount: 150000, description: 'Order #12', reference: { type: 'order', id: order.id },
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
 *
 *   const mine = await core.forOrg(orgId).products.list({});            // the ones this plugin uses
 *   const found = await core.forOrg(orgId).products.list({ search: 'phone', all: true });
 *   await core.forOrg(orgId).products.use({ ids: [found.data[0].id], used: true });
 *   // An invoice may list what it pays for; `plugin` names another plugin's line (it gets the events):
 *   //   lines: [{ productId, quantity: 1, unitPrice: 150000 }, { name: 'Delivery', quantity: 1, unitPrice: 10000, plugin: 'tms' }]
 *
 * Tiers on SaaS (erxes.io: free / plus / pro; self-hosted: pro, full):
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *   if (member.tier === 'free' && employees >= 20) throw new Error('Upgrade to Plus for more employees');
 *   if (!member.canChange()) throw new Error('HR is read-only: buy it again on erxes.io');
 *   // server-side jobs: await core.forOrg(orgId).saas.pluginPlan() → { tier, access }
 *
 * The client secret is only ever sent to `POST /plugins/token`; API calls use
 * 15-minute tokens, fetched and renewed here. Plugins on core's database can
 * also call `core_publish_event()`, `core_record_audit()` and
 * `core_live_signal()` inside their own transactions.
 */

export * from './client';

export * from './verify';
