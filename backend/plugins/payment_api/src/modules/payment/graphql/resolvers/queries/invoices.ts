import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';

export interface IParam {
  searchValue?: string;
  kind?: string;
  status?: string;
  contentType?: string;
  contentTypeId?: string;
}

const buildKindQuery = async (kind: string, models: IContext['models']) => {
  const [txInvoiceIds, pmIds] = await Promise.all([
    models.Transactions.find({ paymentKind: kind }).distinct('invoiceId'),
    models.PaymentMethods.find({ kind }).distinct('_id'),
  ]);

  const conditions: any[] = [];
  if (txInvoiceIds.length > 0) conditions.push({ _id: { $in: txInvoiceIds } });
  if (pmIds.length > 0) conditions.push({ paymentIds: { $in: pmIds.map(String) } });

  if (conditions.length === 0) return { _id: { $in: [] } };
  if (conditions.length === 1) return conditions[0];
  return { $or: conditions };
};

const generateFilterQuery = async (params: IParam, models: IContext['models']) => {
  const query: any = {};
  const { searchValue, kind, status, contentType, contentTypeId } = params;

  if (kind) {
    Object.assign(query, await buildKindQuery(kind, models));
  }

  if (status) {
    query.status = status;
  }

  if (searchValue) {
    const regex = new RegExp(`.*${searchValue}.*`, 'i');
    const searchCondition = { $or: [{ description: regex }, { invoiceNumber: regex }] };
    if (query.$or) {
      // kind filter already set $or — wrap both in $and to avoid key collision
      const kindOr = query.$or;
      delete query.$or;
      query.$and = [{ $or: kindOr }, searchCondition];
    } else {
      Object.assign(query, searchCondition);
    }
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

const queries: Record<string, Resolver> = {
  async invoices(_root, params: any, { models }: IContext) {
    const query = await generateFilterQuery(params, models);

    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.Invoices,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });

    return { list, pageInfo, totalCount };
  },

  async cpInvoices(_root, params: any, { models }: IContext) {
    const query = await generateFilterQuery(params, models);

    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.Invoices,
      params: { ...params, orderBy: { createdAt: -1 } },
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

    const qry = await generateFilterQuery(params, models);

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
          ? { $and: [await buildKindQuery(kind, models), qry] }
          : await buildKindQuery(kind, models);

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
