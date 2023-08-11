import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { MonpayAPI } from '../../../api/monpay/api';
import { PAYMENTS } from '../../../api/constants';
import { QPayQuickQrAPI } from '../../../api/qpayQuickqr/api';

interface IParam {
  searchValue?: string;
  kind?: string;
  status?: string;
}

const generateFilterQuery = (params: IParam) => {
  const query: any = {};
  const { searchValue, kind, status } = params;

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query.isActive = status === 'active' ? true : false;
  }

  if (searchValue) {
    const regex = new RegExp(`.*${searchValue}.*`, 'i');
    query.name = regex;
  }

  return query;
};

const queries = {
  payments(_root, args, { models }: IContext) {
    const filter: any = {};

    if (args.status) {
      filter.status = args.status;
    }

    return models.Payments.find(filter)
      .sort({ type: 1 })
      .lean();
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
      return models.Payments.find(query).countDocuments();
    };

    for (const kind of PAYMENTS.ALL) {
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
  },

  async qpayGetMerchant(_root, args, { models }: IContext) {
    const api = new QPayQuickQrAPI({
      username: process.env.QUICK_QR_USERNAME || '',
      password: process.env.QUICK_QR_PASSWORD || ''
    });

    return api.get(args._id);
  }
};

requireLogin(queries, 'payments');
checkPermission(queries, 'payments', 'showPayments', []);

export default queries;
