import { IContext } from '../../../connectionResolver';


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



export default transactionQueries;
