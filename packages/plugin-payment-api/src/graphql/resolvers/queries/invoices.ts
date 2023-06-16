import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from '../../../api/constants';

interface IParam {
  searchValue?: string;
  kind?: string;
  status?: string;
  contentType?: string;
  contentTypeId?: string;
}

const generateFilterQuery = (params: IParam) => {
  const query: any = {};
  const { searchValue, kind, status, contentType, contentTypeId } = params;

  if (kind) {
    query.paymentKind = kind;
  }

  if (status) {
    query.status = status;
  }

  if (searchValue) {
    const regex = new RegExp(`.*${searchValue}.*`, 'i');
    query.description = regex;
  }

  if (contentType) {
    query.contentType = contentType;
  }

  if (contentTypeId) {
    query.contentTypeId = contentTypeId;
  }

  query.selectedPaymentId = { $exists: true };

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
    const selector = generateFilterQuery(params);

    return paginate(models.Invoices.find(selector).sort({ createdAt: -1 }), {
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
      ...(await generateFilterQuery(params))
    };

    const count = async query => {
      return models.Invoices.find(query).countDocuments();
    };

    for (const kind of PAYMENTS.ALL) {
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

  async invoiceDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Invoices.getInvoice({ _id });
  }
};

requireLogin(queries, 'invoices');
checkPermission(queries, 'invoices', 'showInvoices', []);

export default queries;
