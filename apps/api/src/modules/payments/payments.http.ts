import { integrationConnections, paymentInvoices, withSystem } from '@erxes/core-db';
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

  // What the gateway posted, for drivers that need some of it to check (Toki's mini program).
  if (orgId) await refresh(orgId, id, req.method === 'POST' ? (req.body as unknown) : undefined);

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

/** What Golomt pushes: the transaction (the invoice id core sent) and how it ended ('000': paid). */
const GolomtPush = z.object({
  transactionId: z.union([z.string(), z.number()]).transform(String).pipe(z.string().min(1)),
  errorCode: z.union([z.string(), z.number()]).transform(String).nullish(),
});

/**
 * `POST /core/v1/payments/push/golomt`: Golomt's server-to-server push, which
 * Golomt recommends over the page sending the payer back (lost when the payer
 * closes it). Golomt enables it for the merchant, pointing here. The body is
 * never trusted: the invoice it names is asked of Golomt by inquiry, and
 * while Golomt doesn't confirm it, the answer is 503 so Golomt sends it
 * again (the background check catches up either way).
 */
paymentCallbackRouter.post('/payments/push/golomt', async (req, res) => {
  const push = GolomtPush.safeParse(req.body);

  if (!push.success) {
    res.status(400).json({ status: 'error', message: 'transactionId is required' });

    return;
  }

  // An unsuccessful payment changes nothing here.
  if (push.data.errorCode !== '000') {
    res.status(200).json({ status: 'ok' });

    return;
  }

  const id = push.data.transactionId;

  const [owner] = await withSystem('golomt push lookup', (tx) =>
    tx
      .select({ orgId: paymentInvoices.orgId, key: integrationConnections.key })
      .from(paymentInvoices)
      .innerJoin(integrationConnections, eq(integrationConnections.id, paymentInvoices.gatewayId))
      .where(eq(paymentInvoices.id, id))
      .limit(1),
  );

  if (owner?.key !== 'golomt') {
    res.status(404).json({ status: 'error', message: 'No Golomt invoice has this id' });

    return;
  }

  const { invoice } = await refresh(owner.orgId, id);

  if (invoice.status === 'pending')
    res.status(503).json({ status: 'retry', message: 'Golomt has not confirmed the payment yet' });
  else res.status(200).json({ status: 'ok' });
});
