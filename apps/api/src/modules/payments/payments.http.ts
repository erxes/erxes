import { paymentInvoices, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { safeEqual } from '~/lib/crypto';
import { callbackSignature, refresh } from './invoiceState';

/** Where the invoice's caller wants the payer back (`returnUrl` on create). */
const ReturnTo = z.object({ returnUrl: z.url({ protocol: /^https?$/ }).optional() });

/**
 * `GET|POST /core/v1/payments/callback/:id?sig=…`: the gateway says something
 * happened. The signature proves the address is ours; the status is then
 * asked of the gateway itself — the callback alone never marks anything paid.
 *
 * With `&return=1` it is where card pages (Golomt, TDB, HiPay, Stripe,
 * PayPal) send the payer: after the check, on to the invoice's `returnUrl`.
 * A failed check doesn't keep the payer here; the background check catches up.
 */
export const paymentCallbackRouter = Router();

paymentCallbackRouter.all('/payments/callback/:id', async (req, res) => {
  const { id } = req.params;
  const given = typeof req.query.sig === 'string' ? req.query.sig : '';

  if (!safeEqual(given, callbackSignature(id)))
    throw fail('INVALID_SIGNATURE', 'Invalid signature');

  const [owner] = await withSystem('payment callback lookup', (tx) =>
    tx
      .select({ orgId: paymentInvoices.orgId })
      .from(paymentInvoices)
      .where(eq(paymentInvoices.id, id))
      .limit(1),
  );

  if (req.query.return !== '1') {
    if (owner) await refresh(owner.orgId, id);

    res.status(200).json({ ok: true });

    return;
  }

  const checked = owner
    ? await refresh(owner.orgId, id).catch((error: unknown) => {
        req.log.warn(
          { invoice: id, err: error },
          'could not check the invoice the payer is back from',
        );

        return null;
      })
    : null;

  const back = ReturnTo.safeParse(checked?.invoice.payment ?? {});

  if (back.success && back.data.returnUrl) res.redirect(303, back.data.returnUrl);
  else res.status(200).json({ ok: true });
});
