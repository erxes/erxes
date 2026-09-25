import { IReportConfig } from './common';

export const inventoryReportRules: Record<string, IReportConfig> = {
  invCost: {
    title: 'Барааны тайлан /өртгөөр/',
    colCount: 9,
    choices: [
      { code: 'default', title: 'Данс' },
      { code: 'accBranchDep', title: 'Данс-Салбар-Хэлтэс' },
      { code: 'accDepBranch', title: 'Данс-Хэлтэс-Салбар' },
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
    title: 'Барааны борлуулалтын тайлан /бараагаар/',
    colCount: 4,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'customerProduct', title: 'Харилцагч-Бараа' },
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
    title: 'Барааны борлуулалтын тайлан /өртгөөр/',
    colCount: 6,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'customerProduct', title: 'Харилцагч-Бараа' },
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
    title: 'Борлуулалтын тайлан /өртгөөр/ - үе',
    colCount: 6,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'customerProduct', title: 'Харилцагч-Бараа' },
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
    title: 'Бараа материалын тайлан /зарах үнээр/',
    colCount: 15,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'accountProduct', title: 'Данс-Бараа' },
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
    title: 'Бараа материалын ашгийн тайлан',
    colCount: 6,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'accountProduct', title: 'Данс-Бараа' },
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
    title: 'Барааны нийлүүлэгчийн тайлан',
    colCount: 10,
    choices: [
      { code: 'product', title: 'Бараагаар' },
      { code: 'customerProduct', title: 'Харилцагч-Бараа' },
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
    title: 'Бараа материалын тайлан /баримтаар/',
    colCount: 7,
    choices: [
      { code: 'document', title: 'Баримтаар' },
      { code: 'dateDocument', title: 'Огноо-Баримт' },
      { code: 'customerDocument', title: 'Харилцагч-Баримт' },
      { code: 'userDocument', title: 'Хэрэглэгч-Баримт' },
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
    title: 'Худалдагчийн subsystem тайлан',
    colCount: 7,
    choices: [
      { code: 'systemOrder', title: 'Систем-Захиалга' },
      { code: 'accountOrder', title: 'Данс-Захиалга' },
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
