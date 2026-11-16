import { paymentInvoices, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { type Request, Router } from 'express';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { safeEqual } from '~/lib/crypto';
import { callbackSignature, refresh } from './invoiceState';

/** Where the invoice's caller wants the payer back (`returnUrl` on create). */
const ReturnTo = z.object({ returnUrl: z.url({ protocol: /^https?$/ }).optional() });

const Params = z.object({ id: z.string(), sig: z.string() });

/** The organisation of the invoice the signed address names. */
const ownerOf = async (req: Request) => {
  const { id, sig } = Params.parse(req.params);

  if (!safeEqual(sig, callbackSignature(id))) throw fail('INVALID_SIGNATURE', 'Invalid signature');

  const [owner] = await withSystem('payment callback lookup', (tx) =>
    tx
      .select({ orgId: paymentInvoices.orgId })
      .from(paymentInvoices)
      .where(eq(paymentInvoices.id, id))
      .limit(1),
  );

  return { id, orgId: owner?.orgId ?? null };
};

/**
 * `GET|POST /core/v1/payments/callback/:id/:sig`: the gateway says something
 * happened. The signature proves the address is ours; the status is then
 * asked of the gateway itself — the callback alone never marks anything paid.
 *
 * `…/return` is where card pages (Golomt, TDB, HiPay, Stripe, PayPal) send
 * the payer: after the check, on to the invoice's `returnUrl`. A failed
 * check doesn't keep the payer here; the background check catches up.
 */
export const paymentCallbackRouter = Router();

paymentCallbackRouter.all('/payments/callback/:id/:sig', async (req, res) => {
  const { id, orgId } = await ownerOf(req);

  if (orgId) await refresh(orgId, id);

  res.status(200).json({ ok: true });
});

// Some card pages post the payer back (a form), others send them with a GET.
paymentCallbackRouter.all('/payments/callback/:id/:sig/return', async (req, res) => {
  const { id, orgId } = await ownerOf(req);

  const checked = orgId
    ? await refresh(orgId, id).catch((error: unknown) => {
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
