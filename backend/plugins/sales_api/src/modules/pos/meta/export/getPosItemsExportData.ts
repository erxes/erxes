import {
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

export async function getPosItemsExportData(
  args: GetExportDataArgs,
  { models, subdomain }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { limit = 5000, filters, ids, selectedFields } = args.data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const params: Record<string, unknown> = {
    ...(filters || {}),
    perPage: limit,
    page: 1,
  };

  if (ids && ids.length > 0) {
    params.ids = ids;
  }

  const orders = await posOrderRecordsQuery(models, subdomain, params);

  const fields =
    selectedFields && selectedFields.length > 0
      ? selectedFields
      : [
          'number',
          'createdAt',
          'posName',
          'productCode',
          'productName',
          'count',
          'unitPrice',
          'totalAmount',
        ];

  return (orders as IOrderRecord[]).map((order) => {
    const row: Record<string, any> = {};
    for (const field of fields) {
      switch (field) {
        case 'number':
          row.number = order.number;
          break;
        case 'createdAt':
          row.createdAt = order.createdAt;
          break;
        case 'posName':
          row.posName = order.posName;
          break;
        case 'branch':
          row.branch = order.branch
            ? `${order.branch.order} - ${order.branch.title}`
            : '';
          break;
        case 'department':
          row.department = order.department
            ? `${order.department.order} - ${order.department.title}`
            : '';
          break;
        case 'cashier':
          row.cashier = order.user?.email || '';
          break;
        case 'type':
          row.type = order.type || '';
          break;
        case 'billType':
          row.billType = order.billType || '';
          break;
        case 'registerNumber':
          row.registerNumber = order.registerNumber || '';
          break;
        case 'customerType':
          row.customerType = order.customerType || '';
          break;
        case 'customer':
          row.customer =
            order.customer?.primaryEmail || order.customer?.firstName || '';
          break;
        case 'productCode':
          row.productCode = order.items?.product?.code || '';
          break;
        case 'productName':
          row.productName = order.items?.product?.name || '';
          break;
        case 'categoryCode':
          row.categoryCode = order.items?.productCategory?.code || '';
          break;
        case 'categoryName':
          row.categoryName = order.items?.productCategory?.name || '';
          break;
        case 'barcode':
          row.barcode = (order.items?.product?.barcodes || []).join(', ');
          break;
        case 'count':
          row.count = order.items?.count || 0;
          break;
        case 'unitPrice':
          row.unitPrice = order.items?.unitPrice || 0;
          break;
        case 'discountAmount':
          row.discountAmount = order.items?.discountAmount || 0;
          break;
        case 'totalAmount':
          row.totalAmount = order.totalAmount || 0;
          break;
        case 'paymentType':
          row.paymentType = (order.paidAmounts || [])
            .map((pa) => pa.type)
            .join(', ');
          break;
        default:
          break;
      }
    }
    return row;
  });
}
