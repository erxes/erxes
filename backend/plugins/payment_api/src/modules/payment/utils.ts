import { escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export interface IInvoiceFilterParams {
  searchValue?: string;
  kind?: string;
  status?: string;
  contentType?: string;
  contentTypeId?: string;
}

/**
 * Builds the `_id`/`paymentIds` conditions that match invoices belonging to a
 * given payment kind, by resolving the kind through transactions and payment
 * methods. Shared by the invoice list/count resolvers and the invoice export
 * so both stay in sync.
 */
export const buildInvoiceKindQuery = async (
  kind: string,
  models: IModels,
): Promise<Record<string, any>> => {
  const [txInvoiceIds, pmIds] = await Promise.all([
    models.Transactions.find({ paymentKind: kind }).distinct('invoiceId'),
    models.PaymentMethods.find({ kind }).distinct('_id'),
  ]);

  const conditions: Record<string, any>[] = [];
  if (txInvoiceIds.length > 0) conditions.push({ _id: { $in: txInvoiceIds } });
  if (pmIds.length > 0)
    conditions.push({ paymentIds: { $in: pmIds.map(String) } });

  if (conditions.length === 0) return { _id: { $in: [] } };
  if (conditions.length === 1) return conditions[0];
  return { $or: conditions };
};

/**
 * Builds the MongoDB filter query for invoices from the supported filter
 * params. Shared by the invoice list/count resolvers and the invoice export to
 * guarantee identical filtering behavior.
 */
export const generateInvoiceFilterQuery = async (
  params: IInvoiceFilterParams,
  models: IModels,
): Promise<Record<string, any>> => {
  const query: Record<string, any> = {};
  const { searchValue, kind, status, contentType, contentTypeId } =
    params || {};

  if (kind) {
    Object.assign(query, await buildInvoiceKindQuery(kind, models));
  }

  if (status) {
    query.status = status;
  }

  if (searchValue) {
    const regex = new RegExp(escapeRegExp(searchValue), 'i');
    const searchCondition = {
      $or: [{ description: regex }, { invoiceNumber: regex }],
    };
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
