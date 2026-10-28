import {
  GetExportData,
  GetExportDataArgs,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { posOrderRecordsQuery } from '@/pos/graphql/resolvers/queries/orders';

interface IOrderItem {
  product?: {
    code?: string;
    name?: string;
    barcodes?: string[];
    categoryId?: string;
  };
  productCategory?: {
    code?: string;
    name?: string;
  };
  count?: number;
  unitPrice?: number;
  discountAmount?: number;
}

interface IOrderRecord {
  number?: string;
  createdAt?: string;
  posName?: string;
  branch?: { order: string; title: string };
  department?: { order: string; title: string };
  user?: { email?: string };
  type?: string;
  billType?: string;
  registerNumber?: string;
  customerType?: string;
  customer?: { primaryEmail?: string; firstName?: string };
  items?: IOrderItem;
  totalAmount?: number;
  paidAmounts?: Array<{ type?: string }>;
}

type ExportRow = Record<string, string | number>;

function extractOrderField(
  order: IOrderRecord,
  field: string,
): string | number {
  switch (field) {
    case 'number':
      return order.number ?? '';
    case 'createdAt':
      return order.createdAt ?? '';
    case 'posName':
      return order.posName ?? '';
    case 'branch':
      return order.branch
        ? `${order.branch.order} - ${order.branch.title}`
        : '';
    case 'department':
      return order.department
        ? `${order.department.order} - ${order.department.title}`
        : '';
    case 'cashier':
      return order.user?.email ?? '';
    case 'type':
      return order.type ?? '';
    case 'billType':
      return order.billType ?? '';
    case 'registerNumber':
      return order.registerNumber ?? '';
    case 'customerType':
      return order.customerType ?? '';
    case 'customer':
      return order.customer?.primaryEmail ?? order.customer?.firstName ?? '';
    case 'productCode':
      return order.items?.product?.code ?? '';
    case 'productName':
      return order.items?.product?.name ?? '';
    case 'categoryCode':
      return order.items?.productCategory?.code ?? '';
    case 'categoryName':
      return order.items?.productCategory?.name ?? '';
    case 'barcode':
      return (order.items?.product?.barcodes ?? []).join(', ');
    case 'count':
      return order.items?.count ?? 0;
    case 'unitPrice':
      return order.items?.unitPrice ?? 0;
    case 'discountAmount':
      return order.items?.discountAmount ?? 0;
    case 'totalAmount':
      return order.totalAmount ?? 0;
    case 'paymentType':
      return (order.paidAmounts ?? []).map((pa) => pa.type ?? '').join(', ');
    default:
      return '';
  }
}

const DEFAULT_FIELDS = [
  'number',
  'createdAt',
  'posName',
  'productCode',
  'productName',
  'count',
  'unitPrice',
  'totalAmount',
];

/**
 * One page of POS order items for the export pipeline.
 *
 * Rows are order items, not orders, so each row's `_id` is its position in
 * the export. The pipeline hands the last one back as `cursor`, which is the
 * offset of the next page; a page shorter than `limit` ends the export.
 */
export async function getPosItemsExportData(
  args: GetExportDataArgs | GetExportData,
  { models, subdomain }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const {
    limit = 5000,
    cursor,
    filters,
    ids,
    selectedFields,
  } = 'data' in args ? args.data : args;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const perPage = Math.min(limit, 5000);
  const offset = Number(cursor) || 0;

  const orders = (await posOrderRecordsQuery(models, subdomain, {
    ...(filters ?? {}),
    ...(ids && ids.length > 0 ? { ids } : {}),
    perPage,
    page: Math.floor(offset / perPage) + 1,
  })) as IOrderRecord[];

  const fields =
    selectedFields && selectedFields.length > 0
      ? selectedFields
      : DEFAULT_FIELDS;

  return orders.map((order, index) => {
    const row: ExportRow = { _id: String(offset + index + 1) };
    for (const field of fields) {
      row[field] = extractOrderField(order, field);
    }
    return row;
  });
}
