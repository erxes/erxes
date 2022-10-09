import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { PAYMENT_KINDS } from '../../../constants';
import { IContext } from '../../connectionResolver';
import { PAYMENT_STATUS } from './../../../constants';

interface IParam {
  searchValue?: string;
  kind?: string;
  status?: string;
}

const generateFilterQuery = (params: IParam, isInvoice?: boolean) => {
  const query: any = {};
  const { searchValue, kind, status } = params;

  if (kind) {
    isInvoice ? (query.paymentKind = kind) : (query.kind = kind);
  }

  if (status) {
    isInvoice
      ? (query.status = status)
      : (query.isActive = status === 'active' ? true : false);
  }

  if (searchValue) {
    const regex = new RegExp(`.*${searchValue}.*`, 'i');
    isInvoice ? (query.description = regex) : (query.name = regex);
  }

  return query;
};

const queries = {
  async invoices(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models }: IContext
  ) {
    const selector = generateFilterQuery(params, true);

    return paginate(models.Invoices.find(selector).sort({ createdAt: 1 }), {
      ...params
    });
  },

  async invoicesTotalCount(_root, params: IParam, { models }: IContext) {
    const counts = {
      total: 0,
      byKind: {},
      byStatus: { paid: 0, pending: 0, refunded: 0, failed: 0 }
    };

    const qry = {
      ...(await generateFilterQuery(params, true))
    };

    const count = async query => {
      return models.Invoices.find(query).countDocuments();
    };

    for (const kind of PAYMENT_KINDS.ALL) {
      const countQueryResult = await count({ paymentKind: kind, ...qry });
      counts.byKind[kind] = !params.kind
        ? countQueryResult
        : params.kind === kind
        ? countQueryResult
        : 0;
    }

    for (const status of PAYMENT_STATUS.ALL) {
      const countQueryResult = await count({ status, ...qry });
      counts.byStatus[status] = !params.status
        ? countQueryResult
        : params.status === status
        ? countQueryResult
        : 0;
    }

    counts.total = await count(qry);

    return counts;
  },

  paymentConfigs(_root, args, { models }: IContext) {
    const filter: any = {};

    if (args.status) {
      filter.status = args.status;
    }

    return models.PaymentConfigs.find(filter).sort({ type: 1 });
  },

  async paymentsTotalCount(
    _root,
    args: {
      kind: string;
      status: string;
      searchValue: string;
    },
    { models }: IContext
  ) {
    const counts = {
      total: 0,
      byKind: {},
      byStatus: { active: 0, archived: 0 }
    };

    const qry = {
      ...(await generateFilterQuery(args))
    };

    const count = async query => {
      return models.PaymentConfigs.find(query).countDocuments();
    };

    for (const kind of PAYMENT_KINDS.ALL) {
      const countQueryResult = await count({ kind, ...qry });
      counts.byKind[kind] = !args.kind
        ? countQueryResult
        : args.kind === kind
        ? countQueryResult
        : 0;
    }

    counts.byStatus.active = await count({ isActive: true, ...qry });
    counts.byStatus.archived = await count({ isActive: false, ...qry });

    if (args.status) {
      if (args.status === 'active') {
        counts.byStatus.archived = 0;
      } else {
        counts.byStatus.active = 0;
      }
    }

    counts.total = await count(qry);

    return counts;
  }
};

// requireLogin(queries, 'paymentConfigs');
// requireLogin(queries, 'invoices');

// checkPermission(queries, 'paymentConfigs', 'showPayments', []);
// checkPermission(queries, 'invoices', 'showInvoices', []);

const paymentQueries = {
  getPaymentOptions(_root, params, _args) {
    const MAIN_API_DOMAIN =
      process.env.MAIN_API_DOMAIN || 'http://localhost:4000';

    const base64 = Buffer.from(
      JSON.stringify({
        ...params,
        date: Math.round(new Date().getTime() / 1000)
      })
    ).toString('base64');

    return `${MAIN_API_DOMAIN}/pl:payment/gateway?params=${base64}`;
  }
};

export { queries, paymentQueries };
