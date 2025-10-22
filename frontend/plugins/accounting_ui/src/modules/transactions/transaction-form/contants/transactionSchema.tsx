import { CustomerType } from 'ui-modules';
import { z } from 'zod';
import { TR_SIDES, TrJournalEnum } from '../../types/constants';

export const undefed = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === null ? undefined : val), schema.optional());

//#region common:
export const vatSchema = z.object({
  hasVat: undefed(z.boolean()),
  handleVat: undefed(z.boolean()),
  afterVat: undefed(z.boolean()),
  vatRowId: undefed(z.string()),
  vatAmount: undefed(z.number()),
});

export const ctaxSchema = z.object({
  hasCtax: undefed(z.boolean()),
  handleCtax: undefed(z.boolean()),
  ctaxRowId: undefed(z.string()),
  ctaxAmount: undefed(z.number()),
});

const accountSchema = z.object({
  _id: z.string(),
  code: z.string(),
  name: z.string(),
  currency: z.string(),
  kind: z.string(),
  branchId: undefed(z.string()),
  departmentId: undefed(z.string()),
  journal: z.string(),
})

export const baseTrDetailSchema = z.object({
  _id: z.string(),
  transactionId: undefed(z.string()),

  accountId: undefed(z.string()).refine((val) =>
    val?.length,
    { message: 'Must fill account' }
  ),
  amount: z.number().min(0),
  side: z.string().refine((val) =>
    TR_SIDES.ALL.includes(val),
    { message: 'wrong side aaaa' }
  ),

  followInfos: undefed(z.object({})), // rel backend
  followExtras: undefed(z.object({})), // followInfos to object

  excludeVat: undefed(z.boolean()),
  excludeCtax: undefed(z.boolean()),

  currencyAmount: undefed(z.number()),
  customRate: undefed(z.number()),
  assignedUserId: undefed(z.string()),

  productId: undefed(z.string()),
  count: undefed(z.number()),
  unitPrice: undefed(z.number()),

  checked: undefed(z.boolean()),
  account: undefed(z.object({ ...accountSchema.shape }))
});

export const currencyDetailSchema = z.object({
  currency: undefed(z.string()),
  currencyAmount: undefed(z.number()),
  customRate: undefed(z.number()),
  spotRate: undefed(z.number()),
  followInfos: undefed(z.object({
    currencyDiffAccountId: z.string(),
  })),
})

export const baseTransactionSchema = z.object({
  _id: z.string(),
  ptrId: undefed(z.string()),
  parentId: undefed(z.string()),

  followInfos: undefed(z.object({})),

  description: undefed(z.string()),
  customerType: z.nativeEnum(CustomerType),
  customerId: undefed(z.string()),
  branchId: undefed(z.string()),
  departmentId: undefed(z.string()),
  assignedUserIds: undefed(z.array(z.string())),
  details: z.array(baseTrDetailSchema).min(1),

  ...vatSchema.shape,
  ...ctaxSchema.shape,

  extraData: undefed(z.object({})),
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
  productId: z.string().refine((val) =>
    val?.length,
    { message: 'Must fill product' }
  ),
  count: z.number().gt(0),
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
      accountId: undefed(z.string()),
    })).min(0)
  })
});

export const transactionInvOutSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_OUT),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: undefed(z.string()),
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
  customerId: undefed(z.string()),
  branchId: z.string(),
  departmentId: z.string(),
  followInfos: z.object({
    moveInAccountId: z.string(),
    moveInBranchId: z.string(),
    moveInDepartmentId: z.string(),
  }),
  followExtras: z.object({
    moveInAccount: undefed(z.object({ ...accountSchema.shape })),
  }),
  details: z.array(z.object({
    ...invDetailSchema.shape,
  })),
});

export const transactionInvSaleSchema = z.object({
  journal: z.literal(TrJournalEnum.INV_SALE),
  ...baseTransactionSchema.shape,
}).extend({
  customerId: undefed(z.string()),
  branchId: z.string(),
  departmentId: z.string(),
  followInfos: z.object({
    saleOutAccountId: z.string(),
    saleCostAccountId: z.string(),
  }),
  followExtras: undefed(z.object({
    saleOutAccount: undefed(z.object({ ...accountSchema.shape })),
    saleCostAccount: undefed(z.object({ ...accountSchema.shape }))
  })),
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
  parentId: undefed(z.string()),
  number: undefed(z.string()),
  date: z.date(),
  trDocs: z
    .array(
      trDocSchema
    )
    .min(1),
});
