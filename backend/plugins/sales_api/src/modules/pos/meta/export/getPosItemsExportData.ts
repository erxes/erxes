import {
  GetExportDataArgs,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IPosOrderItem } from '@/pos/@types/orders';
import {
  ExportRow,
  fetchProductCategories,
  pickExportFields,
  toExportNumber,
  uniqueIds,
} from '~/meta/export/utils';
import {
  PosOrderExportLookups,
  buildPosOrderExportRow,
  loadPosOrderBatch,
} from './getPosOrdersExportData';

type CategoryMap = Awaited<ReturnType<typeof fetchProductCategories>>;

/** Item columns for one order line; an order without items gets blanks. */
export const buildPosItemColumns = (
  item: IPosOrderItem | undefined,
  products: PosOrderExportLookups['products'],
  categories: CategoryMap,
): ExportRow => {
  const product = item ? products.get(item.productId) : undefined;
  const category = product?.categoryId
    ? categories.get(product.categoryId)
    : undefined;
  const count = toExportNumber(item?.count);
  const unitPrice = toExportNumber(item?.unitPrice);
  const discountAmount = toExportNumber(item?.discountAmount);

  return {
    productCode: product?.code || '',
    productName: product?.name || item?.productId || '',
    categoryCode: category?.code || '',
    categoryName: category?.name || '',
    barcode: (product?.barcodes || []).join(', '),
    count: item ? count : '',
    unitPrice: item ? unitPrice : '',
    discountAmount: item ? discountAmount : '',
    totalAmount: item ? count * unitPrice - discountAmount : '',
  };
};

/**
 * One CSV row per POS order item, built on the POS order export so both read
 * the same orders, filters and lookups. Every order yields at least one row,
 * so each row's `_id` stays a valid order cursor.
 */
export async function getPosItemsExportData(
  args: GetExportDataArgs,
  ctx: IImportExportContext<IModels>,
): Promise<ExportRow[]> {
  const batch = await loadPosOrderBatch(args, ctx);

  if (!batch) {
    return [];
  }

  const { orders, lookups, selectedFields } = batch;
  const categories = await fetchProductCategories(
    ctx.subdomain,
    uniqueIds([...lookups.products.values()].map((p) => p.categoryId)),
  );

  return orders.flatMap((order) => {
    const orderRow = buildPosOrderExportRow(order, lookups);
    const items: Array<IPosOrderItem | undefined> = order.items?.length
      ? order.items
      : [undefined];

    return items.map((item) =>
      pickExportFields(
        String(order._id),
        {
          ...orderRow,
          paymentType: orderRow.paymentTypes,
          orderTotalAmount: orderRow.totalAmount,
          ...buildPosItemColumns(item, lookups.products, categories),
        },
        selectedFields,
      ),
    );
  });
}
