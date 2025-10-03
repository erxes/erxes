import { CustomerType } from 'ui-modules';
import { z } from 'zod';
import { TR_SIDES, TrJournalEnum } from '../../types/constants';

//#region common:
export const vatSchema = z.object({
  hasVat: z.boolean().nullish(),
  handleVat: z.boolean().optional().nullish(),
  afterVat: z.boolean().optional().nullish(),
  vatRowId: z.string().optional().nullish(),
  vatAmount: z.number().optional().nullish(),
});

export const ctaxSchema = z.object({
  hasCtax: z.boolean().nullish(),
  handleCtax: z.boolean().optional().nullish(),
  ctaxRowId: z.string().optional().nullish(),
  ctaxAmount: z.number().optional().nullish(),
});

const accountSchema = z.object({
  _id: z.string(),
  code: z.string(),
  name: z.string(),
  currency: z.string(),
  kind: z.string(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  journal: z.string(),
})

export const baseTrDetailSchema = z.object({
  _id: z.string(),
  transactionId: z.string().nullish(),

  accountId: z.string().nullish().refine((val) =>
    val?.length,
    { message: 'Must fill account' }
  ),
  amount: z.number().min(0),
  side: z.string().refine((val) =>
    TR_SIDES.ALL.includes(val),
    { message: 'wrong side aaaa' }
  ),

  followInfos: z.object({}).nullish(), // rel backend
  followExtras: z.object({}).nullish(), // followInfos to object

  excludeVat: z.boolean().nullish(),
  excludeCtax: z.boolean().nullish(),

  currencyAmount: z.number().nullish(),
  customRate: z.number().nullish(),
  assignedUserId: z.string().nullish(),

  productId: z.string().nullish(),
  count: z.number().nullish(),
  unitPrice: z.number().nullish(),

  checked: z.boolean().default(false),
  account: z.object({ ...accountSchema.shape }).nullish()
});

export const currencyDetailSchema = z.object({
  currency: z.string().nullish(),
  currencyAmount: z.number().nullish(),
  customRate: z.number().nullish(),
  spotRate: z.number().nullish(),
  followInfos: z.object({
    currencyDiffAccountId: z.string(),
  }).nullish(),
})

export const baseTransactionSchema = z.object({
  _id: z.string(),
  ptrId: z.string().optional(),
  parentId: z.string().optional(),

  followInfos: z.object({}).nullish(),

  description: z.string().nullish(),
  customerType: z.nativeEnum(CustomerType),
  customerId: z.string().nullish(),
  branchId: z.string().nullish(),
  departmentId: z.string().nullish(),
  assignedUserIds: z.array(z.string()).optional(),
  details: z.array(baseTrDetailSchema).min(1),

  ...vatSchema.shape,
  ...ctaxSchema.shape,

  extraData: z.object({}).nullish(),
});
//#endregion common

//#region Single trs
export const transactionMainSchema = z.object({
  journal: z.literal(TrJournalEnum.MAIN),
  ...baseTransactionSchema.shape,
})

export const transactionCashSchema = z.object({
  journal: z.literal(TrJournalEnum.CASH),
  ...baseTransactionSchema.shape,
}).extend({
  details: z.array(z.object({
    ...baseTrDetailSchema.shape,
    ...currencyDetailSchema.shape,
  })),
}).extend({
  customerId: z.string(),
  hasVat: z.boolean(),
  hasCtax: z.boolean(),
});

export const transactionBankSchema = z.object({
  journal: z.literal(TrJournalEnum.BANK),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string(),
  hasVat: z.boolean(),
  hasCtax: z.boolean(),
});

export const transactionReceivableSchema = z.object({
  journal: z.literal(TrJournalEnum.RECEIVABLE),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string(),
  hasVat: z.boolean(),
  hasCtax: z.boolean(),
});

export const transactionPayableSchema = z.object({
  journal: z.literal(TrJournalEnum.PAYABLE),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string(),
  hasVat: z.boolean(),
  hasCtax: z.boolean(),
});

export const transactionTaxSchema = z.object({
  journal: z.literal(TrJournalEnum.TAX),
  ...baseTransactionSchema.shape,
});
//#endregion Single trs

//#region Inventories
export const invDetailSchema = z.object({
  ...baseTrDetailSchema.shape,
}).extend({
  productId: z.string(),
  count: z.number().min(0),
  unitPrice: z.number().min(0),
});

export const transactionInvIncomeSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_INCOME),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string(),
  branchId: z.string(),
  departmentId: z.string(),
  hasVat: z.boolean(),
  hasCtax: z.boolean(),
  details: z.array(z.object({
    ...invDetailSchema.shape,
  })),
  extraData: z.object({
    invIncomeExpenses: z.array(z.object({
      _id: z.string(),
      title: z.string(),
      rule: z.string(),
      amount: z.number().min(0),
      accountId: z.string().nullish(),
    })).min(0)
  })
});

export const transactionInvOutSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_OUT),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string().nullish(),
  branchId: z.string(),
  departmentId: z.string(),
  details: z.array(z.object({
    ...invDetailSchema.shape,
  })),
});

export const transactionInvMoveSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_MOVE),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string().nullish(),
  branchId: z.string(),
  departmentId: z.string(),
  followInfos: z.object({
    moveInAccountId: z.string(),
    moveInBranchId: z.string(),
    moveInDepartmentId: z.string(),
  }),
  followExtras: z.object({
    moveInAccount: z.object({ ...accountSchema.shape }).nullish(),

  }),
  details: z.array(z.object({
    ...invDetailSchema.shape,
  })),
});

export const transactionInvSaleSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_SALE),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: z.string().nullish(),
  branchId: z.string(),
  departmentId: z.string(),
  followInfos: z.object({
    saleOutAccountId: z.string(),
    saleCostAccountId: z.string(),
  }),
  followExtras: z.object({
    saleOutAccount: z.object({ ...accountSchema.shape }).nullish(),
    saleCostAccount: z.object({ ...accountSchema.shape }).nullish()
  }),
  details: z.array(z.object({
    ...invDetailSchema.shape,
  })),
});
//#endregion Inventories

export const trDocSchema = z
  .discriminatedUnion('journal', [
    transactionMainSchema,
    transactionCashSchema,
    transactionBankSchema,
    transactionReceivableSchema,
    transactionPayableSchema,
    transactionInvIncomeSchema,
    transactionInvOutSchema,
    transactionInvMoveSchema,
    transactionInvSaleSchema,
    // transactionInventorySchema,
    // transactionFixedAssetSchema,
    transactionTaxSchema,
  ])
  // vat
  .refine(
    (data) => {
      if ('hasVat' in data) {
        if (data.hasVat && !data.vatRowId) {
          return false;
        }
      }
      return true;
    },
    {
      path: ['vatRow'],
      message: 'VAT row is required',
    },
  )
  .refine(
    (data) => {
      if ('handleVat' in data) {
        if (data.handleVat && !data.vatAmount) {
          return false;
        }
      }
      return true;
    },
    {
      path: ['vatAmount'],
      message: 'VAT amount is required',
    },
  )
//ctax

// cash

export const transactionGroupSchema = z.object({
  parentId: z.string().optional(),
  number: z.string().optional(),
  date: z.date(),
  trDocs: z
    .array(
      trDocSchema
    )
    .min(1),
});
