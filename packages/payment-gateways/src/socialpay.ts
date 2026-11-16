import { z } from 'zod';
import {
  Amount,
  fromTugrug,
  gatewayHttp,
  hmacHex,
  json,
  NO_INSTRUCTIONS,
  parse,
  probeId,
  qrInstructions,
  toTugrug,
} from './http';
import {
  type DriverOptions,
  type GatewayDriver,
  GatewayError,
  type SocialPayConfig,
} from './types';

const Answer = z.object({
  header: z.object({ code: z.coerce.number() }).optional(),
  body: z
    .object({
      response: z
        .object({
          status: z.string().nullish(),
          desc: z.string().nullish(),
          resp_code: z.string().nullish(),
          resp_desc: z.string().nullish(),
          amount: Amount.nullish(),
        })
        .nullish(),
      error: z.object({ errorDesc: z.string().nullish() }).nullish(),
    })
    .optional(),
});

/**
 * SocialPay (Golomt Bank's wallet) in-store invoices: a deeplink QR, or a push
 * to the payer's phone when it is given. Every request is signed with the
 * terminal key: HMAC-SHA256 of terminal + invoice + amount (+ phone).
 */
export const socialpayDriver = (
  config: SocialPayConfig,
  options: DriverOptions = {},
): GatewayDriver => {
  const send = gatewayHttp('SocialPay', 'https://instore.golomtbank.com/pos/invoice', options);

  const signed = (invoice: string, amount: number, phone?: string) => {
    const text = String(toTugrug(amount));

    return {
      amount: text,
      invoice,
      terminal: config.terminal,
      ...(phone ? { phone } : {}),
      checksum: hmacHex(config.terminalKey, config.terminal + invoice + text + (phone ?? '')),
    };
  };

  const call = async (path: string, body: ReturnType<typeof signed>) => {
    const answer = parse(
      'SocialPay',
      Answer,
      await send(path, { method: 'POST', body: json(body) }),
      'an unreadable answer',
    );

    if (answer.header && answer.header.code !== 200)
      throw new GatewayError(
        `SocialPay refused: ${answer.body?.error?.errorDesc ?? answer.header.code}`,
      );

    return answer.body?.response ?? {};
  };

  const createQr = async (invoice: string, amount: number) => {
    const response = await call('/qr/deeplink', signed(invoice, amount));

    if (response.status !== 'SUCCESS' || !response.desc)
      throw new GatewayError(`SocialPay made no invoice: ${response.desc ?? 'no deeplink'}`);

    return response.desc;
  };

  return {
    kind: 'socialpay',
    async verify() {
      // SocialPay has no sign-in: a ₮1 invoice proves the terminal and key, then goes.
      const invoice = probeId();

      await createQr(invoice, 100);
      await call('/cancel', signed(invoice, 100)).catch(() => undefined);
    },
    async createInvoice(input) {
      const phone = input.payerPhone?.replace(/\D/g, '');

      if (phone) {
        const response = await call('/phone', signed(input.invoiceId, input.amount, phone));

        if (response.status !== 'SUCCESS')
          throw new GatewayError(`SocialPay sent no invoice: ${response.desc ?? 'refused'}`);

        return { gatewayInvoiceId: input.invoiceId, payment: NO_INSTRUCTIONS };
      }

      const deeplink = await createQr(input.invoiceId, input.amount);

      return {
        gatewayInvoiceId: input.invoiceId,
        payment: await qrInstructions(deeplink, [{ name: 'SocialPay', link: deeplink }]),
      };
    },
    async check(gatewayInvoiceId, amount) {
      const response = await call('/check', signed(gatewayInvoiceId, amount));
      const paid = response.resp_code === '00';
      const paidAmount = paid ? fromTugrug(response.amount ?? toTugrug(amount)) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? gatewayInvoiceId : null,
      };
    },
    async cancel(gatewayInvoiceId, amount) {
      const response = await call('/cancel', signed(gatewayInvoiceId, amount));

      if (response.resp_code !== '00')
        throw new GatewayError(`SocialPay kept the invoice: ${response.resp_desc ?? 'refused'}`);
    },
    refund() {
      return Promise.reject(new GatewayError('SocialPay makes no refunds'));
    },
  };
};
