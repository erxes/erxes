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

function extractOrderField(order: IOrderRecord, field: string): string | number {
  switch (field) {
    case 'number':      return order.number ?? '';
    case 'createdAt':   return order.createdAt ?? '';
    case 'posName':     return order.posName ?? '';
    case 'branch':      return order.branch ? `${order.branch.order} - ${order.branch.title}` : '';
    case 'department':  return order.department ? `${order.department.order} - ${order.department.title}` : '';
    case 'cashier':     return order.user?.email ?? '';
    case 'type':        return order.type ?? '';
    case 'billType':    return order.billType ?? '';
    case 'registerNumber': return order.registerNumber ?? '';
    case 'customerType':   return order.customerType ?? '';
    case 'customer':    return order.customer?.primaryEmail ?? order.customer?.firstName ?? '';
    case 'productCode': return order.items?.product?.code ?? '';
    case 'productName': return order.items?.product?.name ?? '';
    case 'categoryCode': return order.items?.productCategory?.code ?? '';
    case 'categoryName': return order.items?.productCategory?.name ?? '';
    case 'barcode':     return (order.items?.product?.barcodes ?? []).join(', ');
    case 'count':       return order.items?.count ?? 0;
    case 'unitPrice':   return order.items?.unitPrice ?? 0;
    case 'discountAmount': return order.items?.discountAmount ?? 0;
    case 'totalAmount': return order.totalAmount ?? 0;
    case 'paymentType': return (order.paidAmounts ?? []).map((pa) => pa.type ?? '').join(', ');
    default:            return '';
  }
}

const DEFAULT_FIELDS = [
  'number', 'createdAt', 'posName', 'productCode', 'productName',
  'count', 'unitPrice', 'totalAmount',
];

export async function getPosItemsExportData(
  args: GetExportDataArgs,
  { models, subdomain }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const {
    limit = 5000,
    filters,
    ids,
    selectedFields,
  } = (args?.data ?? args) as GetExportData;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const params: Record<string, unknown> = {
    ...(filters ?? {}),
    perPage: limit,
    page: 1,
  };

  if (ids && ids.length > 0) {
    params.ids = ids;
  }

  const orders = (await posOrderRecordsQuery(models, subdomain, params)) as IOrderRecord[];
  const fields = selectedFields && selectedFields.length > 0 ? selectedFields : DEFAULT_FIELDS;

  return orders.map((order) => {
    const row: ExportRow = {};
    for (const field of fields) {
      row[field] = extractOrderField(order, field);
    }
    return row;
  });
}
