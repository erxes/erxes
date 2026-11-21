import { z } from 'zod';
import { hmacSha256 } from '~/lib/crypto';
import { defineIntegration, secret } from '../define';
import {
  Amount,
  fromTugrug,
  gatewayHttp,
  json,
  parse,
  probeId,
  qrInstructions,
  toTugrug,
} from './http';
import { type DriverOptions, type GatewayDriver, GatewayError } from './types';

const keys = z.object({ checksumKey: secret('Checksum key'), token: secret('Token') });

type GolomtConfig = z.output<typeof keys>;

const BASE = 'https://ecommerce.golomtbank.com';

const InvoiceAnswer = z.object({
  invoice: z.string().nullish(),
  socialDeeplink: z.string().nullish(),
  message: z.string().nullish(),
});

const InquiryAnswer = z.object({
  status: z.string().nullish(),
  amount: Amount.nullish(),
  errorDesc: z.string().nullish(),
});

/**
 * Golomt Bank card e-commerce: an invoice whose payment page takes cards (and a
 * SocialPay deeplink), checked by inquiry. Requests carry the merchant token;
 * checksums are HMAC-SHA256 with the merchant key. The page sends the payer to
 * the callback address once paid.
 */
const golomtDriver = (config: GolomtConfig, options: DriverOptions = {}): GatewayDriver => {
  const send = gatewayHttp('Golomt', `${BASE}/api`, options);
  const headers = { Authorization: `Bearer ${config.token}` };

  const invoice = async (transactionId: string, amount: number, callback: string) => {
    const text = String(toTugrug(amount));

    const answer = parse(
      'Golomt',
      InvoiceAnswer,
      await send('/invoice', {
        method: 'POST',
        headers,
        body: json({
          amount: text,
          callback,
          checksum: hmacSha256(config.checksumKey, `${transactionId}${text}GET${callback}`, 'hex'),
          genToken: 'N',
          returnType: 'GET',
          socialDeeplink: 'Y',
          transactionId,
        }),
      }),
      'no invoice',
    );

    if (!answer.invoice) throw new GatewayError(`Golomt made no invoice: ${answer.message ?? ''}`);

    return answer;
  };

  return {
    kind: 'golomt',
    async verify() {
      // No sign-in endpoint: a ₮1 invoice proves the token and key; unpaid, it lapses.
      await invoice(probeId(), 100, `${BASE}/`);
    },
    async createInvoice(input) {
      const answer = await invoice(input.invoiceId, input.amount, input.returnUrl);
      const page = `${BASE}/payment/mn/${answer.invoice}`;
      const links = [{ name: 'Golomt', link: page }];

      if (answer.socialDeeplink) links.push({ name: 'SocialPay', link: answer.socialDeeplink });

      return {
        gatewayInvoiceId: input.invoiceId,
        payment: await qrInstructions(page, links, page),
      };
    },
    async check(gatewayInvoiceId, amount) {
      const answer = parse(
        'Golomt',
        InquiryAnswer,
        await send('/inquiry', {
          method: 'POST',
          headers,
          body: json({
            transactionId: gatewayInvoiceId,
            checksum: hmacSha256(config.checksumKey, gatewayInvoiceId + gatewayInvoiceId, 'hex'),
          }),
        }),
        'an unreadable inquiry',
      );

      const paid = answer.status === 'SENT';
      const paidAmount = paid ? (answer.amount ? fromTugrug(answer.amount) : amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? gatewayInvoiceId : null,
      };
    },
    async cancel() {
      // Golomt invoices can't be withdrawn; an unpaid one lapses.
    },
    refund() {
      return Promise.reject(
        new GatewayError('Golomt refunds are made in the bank’s merchant portal'),
      );
    },
  };
};

export const golomt = defineIntegration({
  key: 'golomt',
  name: 'Golomt Bank',
  summary: "Card payments on Golomt Bank's page, with a SocialPay link.",
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  verify: (config, options) => golomtDriver(config, options).verify(),
  payments: { currencies: ['MNT'], refunds: 'none', pays: 'card', driver: golomtDriver },
});
