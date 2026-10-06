import { IReportConfig } from './common';

export const inventoryReportRules: Record<string, IReportConfig> = {
  invCost: {
    title: 'inventory-report-at-cost',
    colCount: 9,
    choices: [
      { code: 'default', title: 'account' },
      { code: 'accBranchDep', title: 'account-branch-department' },
      { code: 'accDepBranch', title: 'account-department-branch' },
    ],
    groups: {
      default: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
        },
      },
      accBranchDep: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'branchId',
          code: 'branchCode',
          name: 'branchName',
          style: 'font-semibold',
          groupRule: {
            group: 'departmentId',
            code: 'departmentCode',
            name: 'departmentName',
            style: 'font-semibold',
            groupRule: {
              group: 'productId',
              code: 'productCode',
              name: 'productName',
              from: ['details'],
            },
          },
        },
      },
      accDepBranch: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'departmentId',
          code: 'departmentCode',
          name: 'departmentName',
          style: 'font-semibold',
          groupRule: {
            group: 'branchId',
            code: 'branchCode',
            name: 'branchName',
            style: 'font-semibold',
            groupRule: {
              group: 'productId',
              code: 'productCode',
              name: 'productName',
              from: ['details'],
            },
          },
        },
      },
    },
  },
  invSale: {
    title: 'sales-report-by-product',
    colCount: 4,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'customerProduct', title: 'contact-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      customerProduct: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invSaleCost: {
    title: 'sales-cost-report',
    colCount: 6,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'customerProduct', title: 'contact-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      customerProduct: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invSaleCostPeriod: {
    title: 'sales-cost-report-by-period',
    colCount: 6,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'customerProduct', title: 'contact-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      customerProduct: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invByPrice: {
    title: 'inventory-report-at-selling-price',
    colCount: 15,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'accountProduct', title: 'account-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      accountProduct: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invProfit: {
    title: 'inventory-profitability-report',
    colCount: 6,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'accountProduct', title: 'account-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      accountProduct: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invShipper: {
    title: 'inventory-supplier-report',
    colCount: 10,
    choices: [
      { code: 'product', title: 'by-product' },
      { code: 'customerProduct', title: 'contact-product' },
    ],
    groups: {
      product: {
        group: 'productId',
        code: 'productCode',
        name: 'productName',
        from: ['details'],
        groupRule: null,
      },
      customerProduct: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
        style: 'font-semibold',
        groupRule: {
          group: 'productId',
          code: 'productCode',
          name: 'productName',
          from: ['details'],
          groupRule: null,
        },
      },
    },
  },
  invSaleDaily: {
    title: 'inventory-report-by-document',
    colCount: 7,
    choices: [
      { code: 'document', title: 'by-document' },
      { code: 'dateDocument', title: 'date-document' },
      { code: 'customerDocument', title: 'contact-document' },
      { code: 'userDocument', title: 'user-document' },
    ],
    groups: {
      document: {
        group: 'ptrId',
        code: 'date',
        name: 'description',
        groupRule: null,
      },
      dateDocument: {
        group: 'date',
        code: 'date',
        style: 'font-semibold',
        groupRule: {
          group: 'ptrId',
          code: 'ptrNumber',
          name: 'description',
          groupRule: null,
        },
      },
      customerDocument: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
        style: 'font-semibold',
        groupRule: {
          group: 'ptrId',
          code: 'ptrNumber',
          name: 'description',
          groupRule: null,
        },
      },
      userDocument: {
        group: 'createdBy',
        code: 'createdByCode',
        name: 'createdByName',
        style: 'font-semibold',
        groupRule: {
          group: 'ptrId',
          code: 'ptrNumber',
          name: 'description',
          groupRule: null,
        },
      },
    },
  },
  invSellerSubsys: {
    title: 'salesperson-subsystem-report',
    colCount: 7,
    choices: [
      { code: 'systemOrder', title: 'system-order' },
      { code: 'accountOrder', title: 'account-order' },
    ],
    groups: {
      systemOrder: {
        group: 'contentId',
        code: 'contentCode',
        name: 'contentName',
        style: 'font-semibold',
        groupRule: {
          group: 'ptrId',
          code: 'ptrNumber',
          name: 'description',
          groupRule: null,
        },
      },
      accountOrder: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'contentId',
          code: 'contentCode',
          name: 'contentName',
          groupRule: null,
        },
      },
    },
  },
};
