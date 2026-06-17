import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IInvoiceDocument } from '~/modules/payment/@types/invoices';
import { generateInvoiceFilterQuery } from '~/modules/payment/utils';
import { INVOICE_EXPORT_FIELD_KEYS } from './getInvoiceExportHeaders';
import { buildInvoiceExportRow } from './buildInvoiceExportRow';

export async function getInvoiceExportData(
  data: GetExportData,
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, string>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const effectiveLimit = normalizeExportLimit(limit, 100);

  const baseQuery = await generateInvoiceFilterQuery(filters || {}, models);

  const { query, isIdsMode } = buildExportCursorQuery({
    baseQuery,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && query._id?.$in?.length === 0) {
    return [];
  }

  const invoices = await models.Invoices.find(query)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .select(INVOICE_EXPORT_FIELD_KEYS.join(' '))
    .lean<IInvoiceDocument[]>();

  return invoices.map((invoice) =>
    buildInvoiceExportRow(invoice, selectedFields),
  );
}
