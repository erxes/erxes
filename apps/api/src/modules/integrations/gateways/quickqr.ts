import { z } from 'zod';
import {
  basic,
  gatewayHttp,
  json,
  NO_INSTRUCTIONS,
  parse,
  qrInstructions,
  Text,
  tokenCache,
  toTugrug,
  withBearer,
} from './http';
import { choice, defineIntegration, digits, field, kept } from '../define';
import { type ClientOptions, GatewayError } from './types';

/**
 * The merchant, signed up under the platform's QPay vendor account on
 * connecting (which keeps `merchantId`), and the bank account it is paid
 * into. Codes: MCC, city and district (QuickQR's), bank (6 digits).
 */
/**
 * As in 3.x: a company gives its name, a person their first and last name
 * (QuickQR's `company` and `person` merchants).
 */
const keys = z
  .object({
    merchantType: choice('Merchant type', ['company', 'person']),
    businessName: field('Company name').optional(),
    firstName: field('First name').optional(),
    lastName: field('Last name').optional(),
    registerNumber: field('Register number'),
    mccCode: field('MCC code', digits()),
    city: field('City', digits()),
    district: field('District', digits()),
    address: field('Address'),
    phone: field(
      'Phone',
      z
        .string()
        .trim()
        .regex(/^\d{8}$/, '8 digits'),
    ),
    email: field('Email', z.email().trim().max(200)),
    bankCode: field('Bank', digits()),
    bankAccount: field('Bank account', digits()),
    bankAccountName: field('Bank account name'),
    /**
     * As 3.x asked for it (required): the IBAN's digits between `MN` and the
     * account number — check digits, bank code and padding, `75000500` at Khan
     * Bank. QPay pays the merchant's account with it.
     */
    iban: field(
      'IBAN number',
      z
        .string()
        .trim()
        .regex(/^\d{6,12}$/, 'the IBAN digits before the account number'),
    ),
    merchantId: kept('Merchant ID'),
  })
  .refine((config) => config.merchantType !== 'company' || Boolean(config.businessName), {
    message: 'A company needs its name',
    path: ['businessName'],
  })
  .refine(
    (config) => config.merchantType !== 'person' || Boolean(config.firstName && config.lastName),
    { message: 'A person needs their first and last name', path: ['lastName'] },
  );

type QuickQrConfig = z.output<typeof keys>;

/** The terminal QPay gave the vendor account; the same for every merchant under it. */
const VENDOR_TERMINAL = '95000059';

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().optional(),
});

const MerchantAnswer = z.object({ id: Text.pipe(z.string().min(1)) });

const MerchantList = z.object({
  rows: z
    .array(z.object({ id: Text, type: z.string().nullish(), register_number: Text.nullish() }))
    .nullish(),
});

const InvoiceAnswer = z.object({
  id: Text.pipe(z.string().min(1)),
  qr_image: z.string().nullish(),
  qr_code: z.string().nullish(),
  urls: z
    .array(z.object({ name: z.string(), logo: z.string().nullish(), link: z.string() }))
    .nullish(),
});

const CheckAnswer = z.object({ invoice_status: z.string().nullish() });

const Districts = z.array(z.object({ code: Text, name: z.string() }));

const PAGE_SIZE = 20;
const MAX_PAGES = 50;

/** QuickQR answers this (in English or Mongolian) when the register number is already a merchant. */
const ALREADY_REGISTERED = /MERCHANT_ALREADY_REGISTERED|Бүртгэлтэй мерчант байна/u;

/** Calls through the platform's vendor account. */
const vendorApi = (options: ClientOptions) => {
  const vendor = options.quickQr;

  if (!vendor)
    throw new GatewayError(
      'This server has no QPay QuickQR vendor account (QUICK_QR_USERNAME and QUICK_QR_PASSWORD)',
    );

  const send = gatewayHttp('QuickQR', `${vendor.url}/v2`, options);

  const cache = tokenCache(`quickqr:${vendor.username}`, async () => {
    const answer = parse(
      'QuickQR',
      TokenAnswer,
      await send('/auth/token', {
        method: 'POST',
        headers: { Authorization: basic(vendor.username, vendor.password) },
        body: json({ terminal_id: VENDOR_TERMINAL }),
      }),
      'no access token',
    );

    return { token: answer.access_token, expiresIn: answer.expires_in };
  });

  return { call: withBearer(send, cache.token), cache };
};

/** The districts (sum/düüreg) of a city or aimag, by its code, for the merchant's address. */
export const quickQrDistricts = async (city: string, options: ClientOptions = {}) => {
  const { call } = vendorApi(options);

  return parse(
    'QuickQR',
    Districts,
    await call(`/sumduureg/${encodeURIComponent(city)}`),
    'an unreadable district list',
  );
};

/** What QuickQR takes to register or update a merchant. */
const merchantBody = (config: QuickQrConfig) => {
  const common = {
    register_number: config.registerNumber,
    mcc_code: config.mccCode,
    city: config.city,
    district: config.district,
    address: config.address,
    phone: config.phone,
    email: config.email,
  };

  const personName = `${config.firstName ?? ''} ${config.lastName ?? ''}`.trim();

  return config.merchantType === 'company'
    ? { ...common, company_name: config.businessName, name: config.businessName }
    : {
        ...common,
        business_name: config.businessName ?? personName,
        first_name: config.firstName,
        last_name: config.lastName,
      };
};

/** Signs the merchant up under the vendor account, or updates it: its QuickQR id. */
const registrar = (config: QuickQrConfig, call: ReturnType<typeof vendorApi>['call']) => {
  const path = (type: string | null | undefined) =>
    type?.toUpperCase() === 'COMPANY' || (!type && config.merchantType === 'company')
      ? '/merchant/company'
      : '/merchant/person';

  const save = async (method: 'POST' | 'PUT', at: string) =>
    parse(
      'QuickQR',
      MerchantAnswer,
      await call(at, { method, body: json(merchantBody(config)) }),
      'no merchant id',
    ).id;

  /** The merchant already registered with this register number, page by page. */
  const existing = async (page = 1): Promise<{ id: string; type?: string | null } | null> => {
    if (page > MAX_PAGES) return null;

    const list = parse(
      'QuickQR',
      MerchantList,
      await call('/merchant/list', {
        method: 'POST',
        body: json({ offset: { page_number: page, page_limit: PAGE_SIZE } }),
      }),
      'an unreadable merchant list',
    );

    const rows = list.rows ?? [];
    const found = rows.find((row) => row.register_number === config.registerNumber);

    if (found) return found;

    return rows.length < PAGE_SIZE ? null : existing(page + 1);
  };

  return async () => {
    if (config.merchantId)
      return save('PUT', `${path(null)}/${encodeURIComponent(config.merchantId)}`);

    try {
      return await save('POST', path(null));
    } catch (error) {
      if (!(error instanceof Error) || !ALREADY_REGISTERED.test(error.message)) throw error;

      const found = await existing();

      if (!found) throw error;

      return save('PUT', `${path(found.type)}/${encodeURIComponent(found.id)}`);
    }
  };
};

/**
 * QPay QuickQR: the merchant is signed up under the platform's QPay vendor
 * account (no QPay contract of its own) and paid into its bank account. QR
 * invoices, checked by QuickQR's payment check.
 */
export const quickqr = defineIntegration({
  key: 'quickqr',
  name: 'QPay QuickQR',
  summary: 'QPay QR invoices paid straight into your bank account, no QPay contract of your own.',
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  client: (config, options) => ({ config, vendor: () => vendorApi(options) }),
  async verify({ vendor }) {
    const { cache } = vendor();

    cache.forget();
    await cache.token();
  },
  register: async ({ config, vendor }) => ({
    merchantId: await registrar(config, vendor().call)(),
  }),
  payments: {
    currencies: ['MNT'],
    refunds: 'none',
    pays: 'bank-qr',
    async createInvoice({ config, vendor }, input) {
      if (!config.merchantId) throw new GatewayError('QuickQR merchant is not registered yet');

      const answer = parse(
        'QuickQR',
        InvoiceAnswer,
        await vendor().call('/invoice', {
          method: 'POST',
          body: json({
            merchant_id: config.merchantId,
            amount: toTugrug(input.amount),
            currency: 'MNT',
            callback_url: input.callbackUrl,
            description: input.description,
            mcc_code: config.mccCode,
            bank_accounts: [
              {
                default: true,
                is_default: true,
                account_bank_code: config.bankCode,
                account_number: config.bankAccount,
                account_name: config.bankAccountName,
                iban_number: config.iban,
              },
            ],
          }),
        }),
        'no invoice',
      );

      const links = answer.urls ?? [];
      const image = answer.qr_image ? `data:image/png;base64,${answer.qr_image}` : null;

      // QuickQR sends its QR as an image, with the text when it has it.
      const payment = answer.qr_code
        ? { ...(await qrInstructions(answer.qr_code, links)), ...(image && { qrImage: image }) }
        : {
            ...NO_INSTRUCTIONS,
            qrImage: image,
            links: links.map((link) => ({ ...link, logo: null })),
          };

      if (!payment.qrImage) throw new GatewayError('QuickQR made an invoice with no QR');

      return { gatewayInvoiceId: answer.id, payment };
    },
    async check({ vendor }, { gatewayInvoiceId, amount }) {
      const answer = parse(
        'QuickQR',
        CheckAnswer,
        await vendor().call('/payment/check', {
          method: 'POST',
          body: json({ invoice_id: gatewayInvoiceId }),
        }),
        'an unreadable check',
      );

      const paid = answer.invoice_status === 'PAID';

      return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? gatewayInvoiceId : null };
    },
    async cancel() {
      // QuickQR invoices aren't withdrawn; an unpaid one lapses.
    },
    refund() {
      return Promise.reject(new GatewayError('QuickQR makes no refunds'));
    },
  },
});
