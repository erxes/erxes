import { z } from 'zod';
import { basic, gatewayHttp, json, parse, probeId, qrInstructions, Text, toTugrug } from './http';
import { type DriverOptions, type GatewayDriver, GatewayError, type MonPayConfig } from './types';

const Answer = z.object({
  code: z.coerce.number(),
  info: z.string().nullish(),
  result: z.object({ qrcode: z.string().nullish(), uuid: Text.nullish() }).nullish(),
});

/** MonPay's "paid" and "not paid yet" answers to a QR check. */
const PAID = 0;
const PENDING = 23;

/**
 * MonPay (Mobicom's wallet) branch QR purchases: a QR the payer scans in the
 * MonPay app, checked by its uuid. Basic auth with the branch username and
 * account id.
 */
export const monpayDriver = (config: MonPayConfig, options: DriverOptions = {}): GatewayDriver => {
  const send = gatewayHttp('MonPay', 'https://wallet.monpay.mn/rest/branch/qrpurchase', options);
  const headers = { Authorization: basic(config.username, config.accountId) };

  const check = async (uuid: string) =>
    parse(
      'MonPay',
      Answer,
      await send(`/check?${new URLSearchParams({ uuid }).toString()}`, { headers }),
      'an unreadable check',
    );

  return {
    kind: 'monpay',
    async verify() {
      // No sign-in endpoint: a check of an unknown QR answers 401 for wrong credentials.
      await check(probeId());
    },
    async createInvoice(input) {
      const answer = parse(
        'MonPay',
        Answer,
        await send('/generate', {
          method: 'POST',
          headers,
          body: json({
            amount: toTugrug(input.amount),
            generateUuid: true,
            displayName: input.description,
            callbackUrl: input.callbackUrl,
          }),
        }),
        'no QR',
      );

      const { qrcode, uuid } = answer.result ?? {};

      if (answer.code !== PAID || !qrcode || !uuid)
        throw new GatewayError(`MonPay made no QR: ${answer.info ?? answer.code}`);

      return {
        gatewayInvoiceId: uuid,
        payment: await qrInstructions(qrcode),
      };
    },
    async check(gatewayInvoiceId, amount) {
      const answer = await check(gatewayInvoiceId);

      if (answer.code !== PAID && answer.code !== PENDING)
        throw new GatewayError(`MonPay check failed: ${answer.info ?? answer.code}`);

      const paid = answer.code === PAID;

      return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? gatewayInvoiceId : null };
    },
    async cancel() {
      // MonPay QRs can't be withdrawn; an unpaid one lapses on its own.
    },
    refund() {
      return Promise.reject(new GatewayError('MonPay makes no refunds'));
    },
  };
};
