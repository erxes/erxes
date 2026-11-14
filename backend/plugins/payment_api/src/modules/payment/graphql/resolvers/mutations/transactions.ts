import { Resolver } from 'erxes-api-shared/src/core-types';
import { redis } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';

// A pending transaction younger than this is handed back instead of creating
// a new one. Kept short so the provider's QR / payment page is still valid.
const REUSE_WINDOW_MS = 5 * 60 * 1000;

// Serializes concurrent creates for the same invoice + payment method, so a
// double click (two requests ~1s apart) cannot create two transactions.
const LOCK_TTL_SECONDS = 30;
const LOCK_WAIT_MS = 300;
const LOCK_MAX_WAITS = 20; // ~6s, then give up waiting and create anyway

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasDetails = (details: any) =>
  !!details && typeof details === 'object' && Object.keys(details).length > 0;

const findReusableTransaction = (models: IModels, input: any) =>
  models.Transactions.findOne({
    invoiceId: input.invoiceId,
    paymentId: input.paymentId,
    amount: input.amount,
    status: PAYMENT_STATUS.PENDING,
    createdAt: { $gte: new Date(Date.now() - REUSE_WINDOW_MS) },
    // only reuse transactions the provider actually accepted
    response: { $exists: true, $ne: {} },
    'response.error': { $exists: false },
  }).sort({ createdAt: -1 });

const addTransaction = async (
  models: IModels,
  subdomain: string,
  input: any,
) => {
  const invoice = await models.Invoices.getInvoice(
    { _id: input.invoiceId },
    true,
  );

  const description = invoice.description || invoice.invoiceNumber;

  const create = () =>
    models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });

  // Requests carrying their own details (phone number, register number, ...)
  // may target a different payer, so they always get a fresh transaction.
  if (hasDetails(input.details)) {
    return create();
  }

  const lockKey = `payment:transactionCreate:${input.invoiceId}:${input.paymentId}`;

  for (let attempt = 0; attempt <= LOCK_MAX_WAITS; attempt++) {
    const existing = await findReusableTransaction(models, input);

    if (existing) {
      return existing;
    }

    const acquired = await redis.set(
      lockKey,
      '1',
      'EX',
      LOCK_TTL_SECONDS,
      'NX',
    );

    if (acquired) {
      try {
        // another request may have finished between the lookup and the lock
        const created = await findReusableTransaction(models, input);

        return created || (await create());
      } finally {
        await redis.del(lockKey);
      }
    }

    // someone else is creating this transaction right now, wait for it
    await sleep(LOCK_WAIT_MS);
  }

  return create();
};

const mutations: Record<string, Resolver> = {
  async paymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
    return addTransaction(models, subdomain, args.input);
  },

  async cpPaymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
    return addTransaction(models, subdomain, args.input);
  },
};

mutations.paymentTransactionsAdd.wrapperConfig = {
  skipPermission: true,
};

mutations.cpPaymentTransactionsAdd.wrapperConfig = {
  forClientPortal: true,
};

export default mutations;
