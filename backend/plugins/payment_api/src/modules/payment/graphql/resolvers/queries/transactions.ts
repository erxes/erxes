import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';

const buildQuery = (args: any) => {
  const { _ids = [], invoiceId } = args;
  const query: any = {};

  if (_ids.length) {
    query._id = { $in: _ids };
  }

  if (invoiceId) {
    query.invoiceId = invoiceId;
  }

  if (args.searchValue) {
    query.description = { $regex: args.searchValue, $options: 'i' };
  }

  if (args.kind) {
    query.paymentKind = args.kind;
  }

  if (args.status) {
    query.status = args.status;
  }

  return query;
};

const queries = {
  paymentTransactions(_root, args, { models }: IContext) {
    const query = buildQuery(args);

    return models.Transactions.find(query);
  },

  async paymentTransactionsTotalCount(_root, args, { models }: IContext) {
    const counts = {
      total: 0,
      byKind: {},
      byStatus: { paid: 0, pending: 0, refunded: 0, failed: 0 },
    };
    const query = buildQuery(args);

    const count = async (query) => {
      return models.Invoices.find(query).countDocuments();
    };

    for (const kind of PAYMENTS.ALL) {
      const countQueryResult = await count({ paymentKind: kind, ...query });
      counts.byKind[kind] = !args.kind
        ? countQueryResult
        : args.kind === kind
          ? countQueryResult
          : 0;
    }

    for (const status of PAYMENT_STATUS.ALL) {
      const countQueryResult = await count({ status, ...query });
      counts.byStatus[status] = !args.status
        ? countQueryResult
        : args.status === status
          ? countQueryResult
          : 0;
    }

    counts.total = await count(query);

    return counts;
  },
};

requireLogin(queries, 'transactions');
checkPermission(queries, 'transactions', 'showTransactions', []);

export default queries;
