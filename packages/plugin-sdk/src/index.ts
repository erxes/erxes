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
