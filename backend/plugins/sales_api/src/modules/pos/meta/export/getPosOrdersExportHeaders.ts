import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { parseExportHeaders } from '~/meta/export/utils';

export const POS_ORDER_EXPORT_HEADERS = parseExportHeaders(`
  number            | Number             | default
  createdAt         | Created Date       | default
  paidDate          | Paid Date          | default
  dueDate           | Due Date
  posName           | POS Name           | default
  status            | Status             | default
  type              | Type
  origin            | Origin
  branch            | Branch
  department        | Department
  cashier           | Cashier            | default
  customerType      | Customer Type
  customer          | Customer           | default
  billType          | Bill Type
  registerNumber    | Company RD
  billId            | Bill ID
  products          | Products
  itemCount         | Item Count
  discountAmount    | Discount
  totalAmount       | Total Amount       | default
  finalAmount       | Final Amount
  cashAmount        | Cash Amount
  mobileAmount      | Mobile Amount
  paidAmounts       | Other Payments
  paymentTypes      | Payment Types      | default
  dealNumber        | Deal Number
  returnedAt        | Returned At
  returnDescription | Return Description
  description       | Description
`);

/** Fixed column list for POS order exports. */
export async function getPosOrdersExportHeaders(): Promise<
  ImportHeaderDefinition[]
> {
  return POS_ORDER_EXPORT_HEADERS;
}
