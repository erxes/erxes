import * as z from 'zod';
import { defineContract } from '../define';

// Order summary: the fields a list row shows. Only _id is guaranteed by the
// Mongoose model, so the rest stay nullable. posToken is left out on purpose.
const PosOrderCustomer = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  primaryPhone: z.string().nullable(),
});

const PosOrderSummary = z.object({
  _id: z.string(),
  number: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable(),
  createdAt: z.string().nullable(),
  paidDate: z.string().nullable(),
  totalAmount: z.number().nullable(),
  finalAmount: z.number().nullable(),
  cashAmount: z.number().nullable(),
  mobileAmount: z.number().nullable(),
  customerId: z.string().nullable(),
  customerType: z.string().nullable(),
  branchId: z.string().nullable(),
  posName: z.string().nullable(),
  description: z.string().nullable(),
  customer: PosOrderCustomer.nullable(),
});

const PosOrderDetail = PosOrderSummary.extend({
  items: z.unknown().nullable(),
  paidAmounts: z.unknown().nullable(),
  returnInfo: z.unknown().nullable(),
  deliveryInfo: z.unknown().nullable(),
});

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const PosOrderList = z.object({
  list: z.array(PosOrderSummary).nullable(),
  totalCount: z.number().nullable(),
  pageInfo: PageInfo.nullable(),
});

const PosConfig = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  isOnline: z.boolean().nullable(),
  branchId: z.string().nullable(),
  departmentId: z.string().nullable(),
  allowBranchIds: z.array(z.string()).nullable(),
  scopeBrandIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
});

export const salesPosContract = defineContract('sales', 1, [
  {
    name: 'posOrders.list',
    description:
      'Lists POS orders, sorted by order number with the highest first, as the calling user sees them. Returns up to limit orders (default 20, max 50) with totalCount and pageInfo. To get the next page, pass pageInfo.endCursor as cursor with direction "forward". paidStartDate and paidEndDate filter on paid date; createdStartDate and createdEndDate filter on creation date. Dates are ISO strings. Needs posOrderRead. Read-only.',
    kind: 'read',
    field: 'posOrdersList',
    args: {
      limit: 'Int',
      cursor: 'String',
      direction: 'CURSOR_DIRECTION',
      search: 'String',
      statuses: '[String]',
      posId: 'String',
      customerId: 'String',
      paidStartDate: 'Date',
      paidEndDate: 'Date',
      createdStartDate: 'Date',
      createdEndDate: 'Date',
    },
    input: z
      .object({
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
        direction: z.enum(['forward', 'backward']).optional(),
        search: z.string().optional(),
        statuses: z.array(z.string()).optional(),
        posId: z.string().min(1).optional(),
        customerId: z.string().min(1).optional(),
        paidStartDate: z.string().optional(),
        paidEndDate: z.string().optional(),
        createdStartDate: z.string().optional(),
        createdEndDate: z.string().optional(),
      })
      .strict(),
    output: PosOrderList,
  },
  {
    name: 'posOrders.get',
    description:
      'Reads one POS order by its _id, with its items (each item has productName), paid amounts and return info. Throws when no order has that _id. Needs posOrderRead. Read-only.',
    kind: 'read',
    field: 'posOrderDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PosOrderDetail.nullable(),
  },
  {
    name: 'posConfigs.list',
    description:
      'Lists POS configs (point-of-sale terminals) by _id and name, without deleted ones. Pages with page and perPage (max 50). Omit perPage for the server default of 100. isOnline is "online" or "offline". Needs posRead. Read-only.',
    kind: 'read',
    field: 'posList',
    args: {
      page: 'Int',
      perPage: 'Int',
      search: 'String',
      isOnline: 'String',
    },
    input: z
      .object({
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
        search: z.string().optional(),
        isOnline: z.enum(['online', 'offline']).optional(),
      })
      .strict(),
    output: z.array(PosConfig),
  },
  {
    name: 'posConfigs.get',
    description:
      'Reads one POS config by its _id: name, branch and department, brand scope and whether it is online. Returns null when no POS has that _id. Needs posRead. Read-only.',
    kind: 'read',
    field: 'posDetail',
    args: { _id: 'String!' },
    notFound: 'POS not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PosConfig.nullable(),
  },
]);
