import { Resolver } from 'erxes-api-shared/src/core-types';
import { IContext } from '~/connectionResolvers';

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

    return models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });
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

    return models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });
  },
};

mutations.paymentTransactionsAdd.wrapperConfig = {
  skipPermission: true,
};

export default mutations;
