import { paymentInvoices, withOrg, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { callbackSignature, refresh } from './invoiceState';

/**
 * `GET|POST /core/v1/payments/callback/:id?sig=…`: the gateway says something
 * happened. The signature proves the address is ours; the status is then
 * asked of the gateway itself — the callback alone never marks anything paid.
 */
export const paymentCallbackRouter = Router();

paymentCallbackRouter.all('/payments/callback/:id', async (req, res) => {
  const { id } = req.params;
  const given = Buffer.from(typeof req.query.sig === 'string' ? req.query.sig : '');
  const expected = Buffer.from(callbackSignature(id));

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    res.status(403).json({ error: 'invalid signature' });

    return;
  }

  const [owner] = await withSystem('payment callback lookup', (tx) =>
    tx
      .select({ orgId: paymentInvoices.orgId })
      .from(paymentInvoices)
      .where(eq(paymentInvoices.id, id))
      .limit(1),
  );

  if (owner) await withOrg(owner.orgId, (tx) => refresh(tx, owner.orgId, id));

  res.status(200).json({ ok: true });
});
