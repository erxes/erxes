
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { cursorPaginate } from 'erxes-api-shared/utils';

export interface IParam {
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

    if (contentType.includes('cards')) {
      query.contentType = { $in: [contentType, contentType.slice(0, -1)] };
    }
  }

  if (contentTypeId) {
    query.contentTypeId = contentTypeId;
  }

  return query;
};

const queries = {
  async invoices(
    _root,
    params: any,
    { models }: IContext
  ) {
    const query = generateFilterQuery(params);

    const { list, pageInfo, totalCount } =
      await cursorPaginate({
        model: models.Invoices,
        params,
        query,
      });

    return { list, pageInfo, totalCount };
  },

  async invoicesTotalCount(_root, params: IParam, { models }: IContext) {
    const counts = {
      total: 0,
      byKind: {},
      byStatus: { paid: 0, pending: 0, refunded: 0, failed: 0 },
    };

    const qry = {
      ...(await generateFilterQuery(params)),
    };

    const count = async (query) => {
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
  },

  async invoiceDetailByContent(
    _root,
    { contentType, contentTypeId },
    { models }: IContext
  ) {
    return models.Invoices.find({ contentType, contentTypeId }).lean();
  },
};

requireLogin(queries, 'invoices');
checkPermission(queries, 'invoices', 'showInvoices', []);

export default queries;
