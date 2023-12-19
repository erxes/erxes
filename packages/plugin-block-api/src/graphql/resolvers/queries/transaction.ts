import { IContext } from '../../../connectionResolver';
import { getBalance } from '../../../utils';

const transactionQueries = {
  async transaction(
    _root,
    { erxesCustomerId, type },
    { subdomain, models }: IContext
  ) {
    const filter: any = {};

    if (erxesCustomerId) {
      filter.erxesCustomerId = erxesCustomerId;
    }

    if (type) {
      filter.type = type;
    }

    return models.Transactions.find(filter).sort({ createdAt: -1 });
  }
};

// requireLogin(transactionQueries, 'transaction');

export default transactionQueries;
