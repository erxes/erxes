import { Resolver } from 'erxes-api-shared/src/core-types';
import { IContext } from '~/connectionResolvers';
import { QPayQuickQrAPI } from '~/apis/qpayQuickqr/api'; // ✅ required

const mutations: Record<string, Resolver> = {
  async paymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
    const { input } = args;

    const invoice = await models.Invoices.getInvoice(
      { _id: input.invoiceId },
      true,
    );

    const description = invoice.description || invoice.invoiceNumber;

    // ✅ STEP 1: create transaction
    const transaction = await models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });

    // ✅ STEP 2: get payment
    const payment = await models.PaymentMethods.getPayment(input.paymentId);

    // ✅ STEP 3: call QPay ONLY if correct kind
    if (payment?.kind === 'qpayQuickqr') {
      try {
        const api = new QPayQuickQrAPI(payment.config);

        const response = await api.createInvoice(transaction);

        // ✅ STEP 4: save response
        transaction.response = response;
        await transaction.save();
      } catch (e) {
        console.error('❌ QPay error:', e);
      }
    }

    // ✅ STEP 5: return ALWAYS
    return transaction;
  },

  async cpPaymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
    const { input } = args;

    const invoice = await models.Invoices.getInvoice(
      { _id: input.invoiceId },
      true,
    );

    const description = invoice.description || invoice.invoiceNumber;

    const transaction = await models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });

    const payment = await models.PaymentMethods.getPayment(input.paymentId);

    if (payment?.kind === 'qpayQuickqr') {
      try {
        const api = new QPayQuickQrAPI(payment.config);

        const response = await api.createInvoice(transaction);

        transaction.response = response;
        await transaction.save();
      } catch (e) {
        console.error('❌ QPay error:', e);
      }
    }

    return transaction;
  },
};

mutations.paymentTransactionsAdd.wrapperConfig = {
  skipPermission: true,
};

mutations.cpPaymentTransactionsAdd.wrapperConfig = {
  forClientPortal: true,
};

export default mutations;
