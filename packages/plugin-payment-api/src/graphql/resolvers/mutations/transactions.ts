import { IContext } from '../../../connectionResolver';

const mutations = {
  async paymentTransactionsAdd(_root, args: any, { models, subdomain }: IContext) {

    const invoice = await models.Invoices.getInvoice({_id: args.invoiceId}, true);

    const description = invoice.description || invoice.invoiceNumber;

    return models.Transactions.createTransaction({ ...args, subdomain, description });
  },
};

export default mutations;
