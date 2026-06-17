import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import {
  IInvoiceFilterParams,
  buildInvoiceKindQuery,
  generateInvoiceFilterQuery,
} from '~/modules/payment/utils';

const queries: Record<string, Resolver> = {
  async invoices(_root, params: any, { models }: IContext) {
    const query = await generateInvoiceFilterQuery(params, models);

    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.Invoices,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });

    return { list, pageInfo, totalCount };
  },

  async cpInvoices(_root, params: any, { models }: IContext) {
    const query = await generateInvoiceFilterQuery(params, models);

    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.Invoices,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });

    return { list, pageInfo, totalCount };
  },

  async invoicesTotalCount(
    _root,
    params: IInvoiceFilterParams,
    { models }: IContext,
  ) {
    const counts = {
      total: 0,
      byKind: {},
      byStatus: { paid: 0, pending: 0, refunded: 0, failed: 0 },
    };

    const qry = await generateInvoiceFilterQuery(params, models);

    const count = async (query) => {
      return models.Invoices.find(query).countDocuments();
    };

    for (const kind of PAYMENTS.ALL) {
      if (params.kind && params.kind !== kind) {
        counts.byKind[kind] = 0;
        continue;
      }

      const kindFilter = params.kind === kind
        ? qry
        : Object.keys(qry).length > 0
          ? { $and: [await buildInvoiceKindQuery(kind, models), qry] }
          : await buildInvoiceKindQuery(kind, models);

      counts.byKind[kind] = await count(kindFilter);
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

  async cpInvoiceDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Invoices.getInvoice({ _id });
  },

  async invoiceDetailByContent(
    _root,
    { contentType, contentTypeId },
    { models }: IContext,
  ) {
    return models.Invoices.find({ contentType, contentTypeId }).lean();
  },
};

queries.invoiceDetail.wrapperConfig = {
  skipPermission: true,
};

queries.cpInvoiceDetail.wrapperConfig = {
  skipPermission: true,
  forClientPortal: true,
};

queries.cpInvoices.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
