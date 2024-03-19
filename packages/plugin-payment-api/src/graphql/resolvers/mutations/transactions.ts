import { IContext } from '../../../connectionResolver';
import { getEnv } from '@erxes/api-utils/src/core';

const mutations = {
  transactionsAdd(_root, args: any, { models, subdomain }: IContext) {

    const invoice = models.Invoices.getInvoice({_id: args.invoiceId}, true);

    const description = invoice.description || invoice.contentTypeId;


    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const apiDomain = DOMAIN.replace('<subdomain>', subdomain);

    console.log('apiDomain', apiDomain);

    return models.Transactions.createTransaction({ ...args, apiDomain, description });
  },
};

export default mutations;
