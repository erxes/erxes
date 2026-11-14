import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { parseExportHeaders } from '~/meta/export/utils';

export const POS_ITEM_EXPORT_HEADERS = parseExportHeaders(`
  number           | Number           | default
  createdAt        | Created Date     | default
  posName          | POS Name         | default
  branch           | Branch
  department       | Department
  cashier          | Cashier
  type             | Type
  billType         | Bill Type
  registerNumber   | Company RD
  customerType     | Customer Type
  customer         | Customer
  productCode      | Code             | default
  productName      | Product Name     | default
  categoryCode     | Category Code
  categoryName     | Category Name
  barcode          | Barcode
  count            | Count            | default
  unitPrice        | Unit Price       | default
  discountAmount   | Discount
  totalAmount      | Total Amount     | default
  orderTotalAmount | Order Total
  paymentType      | Payment Type
`);

/** Fixed column list for POS item exports, one row per order item. */
export function getPosItemsExportHeaders(): Promise<ImportHeaderDefinition[]> {
  return Promise.resolve(POS_ITEM_EXPORT_HEADERS);
}
