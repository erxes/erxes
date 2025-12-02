import {
  GetExportData,
  GetExportDataArgs,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { generateFilter } from '~/modules/contacts/utils';
import { buildCustomerExportRow } from './buildCustomerExportRow';
import { IModels } from '~/connectionResolvers';

export async function getCustomerExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  // Build base filter from filters object
  let query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    query = await generateFilter(subdomain, filters, models);
  }

  // If specific IDs provided, use them
  if (ids && ids.length > 0) {
    query._id = { $in: ids };
  }

  // Add cursor-based pagination
  if (cursor) {
    query._id = query._id ? { ...query._id, $gt: cursor } : { $gt: cursor };
  }

  // Fetch customers with cursor pagination
  const customers = await models.Customers.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  // Transform to export rows with selected fields
  const selectedFields = data.selectedFields;
  return customers.map((customer) =>
    buildCustomerExportRow(customer, selectedFields),
  );
}
