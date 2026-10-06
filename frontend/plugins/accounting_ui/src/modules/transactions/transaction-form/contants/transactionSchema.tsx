import type { TFunction } from 'i18next';
import { CustomerType } from 'ui-modules';
import { z } from 'zod';
import { TR_SIDES, TR_STATUSES, TrJournalEnum } from '../../types/constants';
import { undefed } from '~/modules/types/utils';

// #region common:
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
});

export const baseTrDetailSchema = (t: TFunction<'accounting'>) =>
  z.object({
    _id: z.string(),
    transactionId: undefed(z.string()),

    accountId: undefed(z.string()).refine(
      (val) => val?.length,
      () => ({
        message: t('select-an-account'),
      }),
    ),
    branchId: undefed(z.string()),
    departmentId: undefed(z.string()),
    amount: z.number().min(0),

    followInfos: undefed(z.object({})), // rel backend
    followExtras: undefed(z.object({})), // followInfos to object

    excludeVat: undefed(z.boolean()),
    excludeCtax: undefed(z.boolean()),

    currencyAmount: undefed(z.number()),
    customRate: undefed(z.number()),
    assignedUserId: undefed(z.string()),

    productId: undefed(z.string()),
    fixedAssetId: undefed(z.string()),
    fixedAssetCategoryId: undefed(z.string()),
    fixedAssetCode: undefed(z.string()),
    fixedAssetName: undefed(z.string()),
    count: undefed(z.number()),
    unitPrice: undefed(z.number()),
    weight: undefed(z.number().min(0)),

    checked: undefed(z.boolean()),
    account: undefed(z.object({ ...accountSchema.shape })),
  });

export const currencyDetailSchema = z.object({
  currency: undefed(z.string()),
  currencyAmount: undefed(z.number()),
  customRate: undefed(z.number()),
  spotRate: undefed(z.number()),
  followInfos: undefed(
    z.object({
      currencyDiffAccountId: z.string(),
    }),
  ),
});

export const baseTransactionSchema = (t: TFunction<'accounting'>) =>
  z.object({
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
    details: z.array(baseTrDetailSchema(t)).min(1),
    side: z.string().refine(
      (val) => TR_SIDES.ALL.includes(val),
      () => ({
        message: t('select-a-valid-transaction-side'),
      }),
    ),
    relAccounts: undefed(
      z.object({
        dt: undefed(z.array(z.string())),
        ct: undefed(z.array(z.string())),
        customDt: z.array(z.string()).optional(),
        customCt: z.array(z.string()).optional(),
      }),
    ),

    ...vatSchema.shape,
    ...ctaxSchema.shape,

    extraData: undefed(z.unknown()),
  });
// #endregion common

// #region Single trs
export const transactionMainSchema = (t: TFunction<'accounting'>) =>
  z.object({
    journal: z.literal(TrJournalEnum.MAIN),
    ...baseTransactionSchema(t).shape,
  });

export const transactionCashSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.CASH),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      details: z.array(
        z.object({
          ...baseTrDetailSchema(t).shape,
          ...currencyDetailSchema.shape,
        }),
      ),
    })
    .extend({
      customerId: z.string(),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
    });

export const extraDataBankSchema = z.object({
  bank: undefed(z.string()),
  bankAccount: undefed(z.string()),
});

export const transactionBankSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.BANK),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: z.string(),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
    })
    .extend({
      extraData: undefed(z.object({ ...extraDataBankSchema.shape })),
    });

export const transactionReceivableSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.RECEIVABLE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: z.string(),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
    });

export const transactionPayableSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.PAYABLE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: z.string(),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
    });

export const transactionTaxSchema = (t: TFunction<'accounting'>) =>
  z.object({
    journal: z.literal(TrJournalEnum.TAX),
    ...baseTransactionSchema(t).shape,
  });
// #endregion Single trs

// #region Inventories
const invSplitInfoSchema = (t: TFunction<'accounting'>) =>
  z.discriminatedUnion('hasSplit', [
    z.object({
      hasSplit: z.literal(false),
      productId: undefed(z.string()),
      ratio: undefed(z.number()),
    }),
    z.object({
      hasSplit: z.literal(true),
      productId: z.string().refine(
        (value) => value.length >= 1,
        () => ({ message: t('select-the-resulting-product') }),
      ),
      ratio: z.number().refine(
        (value) => value > 0,
        () => ({
          message: t('the-split-ratio-must-be-greater-than-zero'),
        }),
      ),
    }),
  ]);

export const invDetailSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      ...baseTrDetailSchema(t).shape,
    })
    .extend({
      productId: z.string().refine(
        (val) => val?.length,
        () => ({ message: t('select-a-product') }),
      ),
      count: z.number().gt(0),
      unitPrice: z.number().min(0),
      followInfos: undefed(
        z.object({
          invSplit: undefed(invSplitInfoSchema(t)),
          moveInBranchId: undefed(z.string()),
          moveInDepartmentId: undefed(z.string()),
        }),
      ),
    });

export const transactionInvIncomeSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_INCOME),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: z.string(),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
      details: z.array(
        z.object({
          ...invDetailSchema(t).shape,
        }),
      ),
      extraData: undefed(
        z.object({
          invIncomeExpenses: z
            .array(
              z.object({
                _id: z.string(),
                title: z.string(),
                rule: z.string(),
                amount: z.number().min(0),
                accountId: undefed(z.string()),
              }),
            )
            .min(0),
        }),
      ),
    });

// #region invOut
export const transactionInvOutSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_OUT),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      details: z.array(
        z.object({
          ...invDetailSchema(t).shape,
        }),
      ),
    });
// #endregion invOut
// #region invJustify
const invJustifyDetailSchema = (t: TFunction<'accounting'>) =>
  invDetailSchema(t).extend({
    count: z.number().min(0).max(0),
  });

export const transactionInvJustifySchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_JUSTIFY),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      details: z.array(
        z.object({
          ...invJustifyDetailSchema(t).shape,
        }),
      ),
    });
// #endregion invJustify
// #region invMove
export const transactionInvMoveSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_MOVE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      followInfos: z.object({
        moveInAccountId: z.string(),
        moveInBranchId: undefed(z.string()),
        moveInDepartmentId: undefed(z.string()),
      }),
      followExtras: undefed(
        z.object({
          moveInAccount: undefed(z.object({ ...accountSchema.shape })),
        }),
      ),
      details: z.array(
        z.object({
          ...invDetailSchema(t).shape,
        }),
      ),
    });
// #endregion invMove
// #region invSale
export const transactionInvSaleSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_SALE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      followInfos: z.object({
        saleOutAccountId: z.string(),
        saleCostAccountId: z.string(),
      }),
      followExtras: undefed(
        z.object({
          saleOutAccount: undefed(z.object({ ...accountSchema.shape })),
          saleCostAccount: undefed(z.object({ ...accountSchema.shape })),
        }),
      ),
      details: z.array(
        z.object({
          ...invDetailSchema(t).shape,
        }),
      ),
    });
// #endregion invSale
// #region invReturnSale
export const transactionInvSaleReturnSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.INV_SALE_RETURN),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      followInfos: z.object({
        saleTransactionId: undefed(z.string()),
        saleOutAccountId: z.string(),
        saleCostAccountId: z.string(),
      }),
      followExtras: undefed(
        z.object({
          saleTransaction: undefed(
            z.object({ ...transactionInvSaleSchema(t).shape }),
          ),
          saleOutAccount: undefed(z.object({ ...accountSchema.shape })),
          saleCostAccount: undefed(z.object({ ...accountSchema.shape })),
        }),
      ),
      details: z.array(
        z.object({
          ...invDetailSchema(t).shape,
        }),
      ),
    });
// #endregion invReturnSale
// #endregion Inventories

// #region Fixed assets
export const fxaDetailSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      ...baseTrDetailSchema(t).shape,
    })
    .extend({
      fixedAssetId: z.string().refine(
        (val) => val?.length,
        () => ({ message: t('select-a-fixed-asset') }),
      ),
      count: z.number().gt(0),
      unitPrice: z.number().min(0),
    });

export const fxaIncomeDetailSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      ...baseTrDetailSchema(t).shape,
    })
    .extend({
      fixedAssetCategoryId: z.string().refine(
        (val) => val?.length,
        () => ({
          message: t('select-a-fixed-asset-category'),
        }),
      ),
      fixedAssetCode: z.string().refine(
        (val) => val?.length,
        () => ({
          message: t('enter-a-fixed-asset-code'),
        }),
      ),
      fixedAssetName: z.string().refine(
        (val) => val?.length,
        () => ({
          message: t('enter-a-fixed-asset-name'),
        }),
      ),
      count: z.number().gt(0),
      unitPrice: z.number().min(0),
    });

export const fxaFollowInfosSchema = z.object({
  accumulatedDepreciationAccountId: undefed(z.string()),
  depreciationExpenseAccountId: undefed(z.string()),
  saleOutAccountId: undefed(z.string()),
  saleCostAccountId: undefed(z.string()),
  revaluationReserveAccountId: undefed(z.string()),
  deferredTaxAssetAccountId: undefed(z.string()),
  deferredTaxLiabilityAccountId: undefed(z.string()),
  incomeTaxExpenseAccountId: undefed(z.string()),
  moveInBranchId: undefed(z.string()),
  moveInDepartmentId: undefed(z.string()),
  ownerId: undefed(z.string()),
});

export const fxaIncomeDetailFollowInfoSchema = z.object({
  _id: undefed(z.string()),
  tempId: undefed(z.string()),
  transactionDetailId: undefed(z.string()),
  fixedAssetId: undefed(z.string()),
  code: undefed(z.string()),
  sequence: undefed(z.number()),
  salvageValue: undefed(z.number()),
  preDeprecation: undefed(z.number()),
});

export const fxaIncomeFollowInfosSchema = fxaFollowInfosSchema.extend({
  fxaIncomeDetails: undefed(z.array(fxaIncomeDetailFollowInfoSchema)),
});

export const fxaOutFollowInfosSchema = (t: TFunction<'accounting'>) =>
  fxaFollowInfosSchema.extend({
    accumulatedDepreciationAccountId: z.string().refine(
      (val) => val?.length,
      () => ({
        message: t('select-an-accumulated-depreciation-account'),
      }),
    ),
  });

export const fxaSaleFollowInfosSchema = (t: TFunction<'accounting'>) =>
  fxaOutFollowInfosSchema(t).extend({
    saleOutAccountId: z.string().refine(
      (val) => val?.length,
      () => ({
        message: t('select-a-fixed-asset-disposal-account'),
      }),
    ),
    saleCostAccountId: z.string().refine(
      (val) => val?.length,
      () => ({
        message: t('select-a-fixed-asset-cost-of-sales-account'),
      }),
    ),
  });

export const fxaMoveFollowInfosSchema = (t: TFunction<'accounting'>) =>
  fxaOutFollowInfosSchema(t).extend({
    moveInBranchId: z.string().refine(
      (val) => val?.length,
      () => ({
        message: t('select-a-destination-branch'),
      }),
    ),
    moveInDepartmentId: undefed(z.string()),
  });

export const fxaFollowExtrasSchema = z.object({
  saleOutAccount: undefed(z.object({ ...accountSchema.shape })),
  accumulatedDepreciationAccount: undefed(z.object({ ...accountSchema.shape })),
  depreciationExpenseAccount: undefed(z.object({ ...accountSchema.shape })),
  saleCostAccount: undefed(z.object({ ...accountSchema.shape })),
  revaluationReserveAccount: undefed(z.object({ ...accountSchema.shape })),
  deferredTaxAssetAccount: undefed(z.object({ ...accountSchema.shape })),
  deferredTaxLiabilityAccount: undefed(z.object({ ...accountSchema.shape })),
  incomeTaxExpenseAccount: undefed(z.object({ ...accountSchema.shape })),
});

export const fxaOwnerRecordInputSchema = z.object({
  _id: undefed(z.string()),
  fxaOwnerRecordId: undefed(z.string()),
  tempId: undefed(z.string()),
  transactionDetailId: z.string(),
  fixedAssetId: undefed(z.string()),
  code: undefed(z.string()),
  sequence: undefed(z.number()),
  count: undefed(z.number()),
  ownerId: undefed(z.string()),
});

export const fxaExtraDataSchema = z.object({
  fxaOwnerRecords: undefed(z.array(fxaOwnerRecordInputSchema)),
});

export const transactionFxaIncomeSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.FXA_INCOME),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
      followInfos: fxaIncomeFollowInfosSchema,
      followExtras: undefed(fxaFollowExtrasSchema),
      extraData: undefed(fxaExtraDataSchema),
      details: z.array(
        z.object({
          ...fxaIncomeDetailSchema(t).shape,
        }),
      ),
    });

export const transactionFxaOutSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.FXA_OUT),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      followInfos: fxaOutFollowInfosSchema(t),
      followExtras: undefed(fxaFollowExtrasSchema),
      extraData: undefed(fxaExtraDataSchema),
      details: z.array(
        z.object({
          ...fxaDetailSchema(t).shape,
        }),
      ),
    });

export const transactionFxaMoveSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.FXA_MOVE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      followInfos: fxaMoveFollowInfosSchema(t),
      followExtras: undefed(fxaFollowExtrasSchema),
      extraData: undefed(fxaExtraDataSchema),
      details: z.array(
        z.object({
          ...fxaDetailSchema(t).shape,
        }),
      ),
    });

export const transactionFxaSaleSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      journal: z.literal(TrJournalEnum.FXA_SALE),
      ...baseTransactionSchema(t).shape,
    })
    .extend({
      customerId: undefed(z.string()),
      branchId: undefed(z.string()),
      departmentId: undefed(z.string()),
      hasVat: z.boolean(),
      hasCtax: z.boolean(),
      followInfos: fxaSaleFollowInfosSchema(t),
      followExtras: undefed(fxaFollowExtrasSchema),
      extraData: undefed(fxaExtraDataSchema),
      details: z.array(
        z.object({
          ...fxaDetailSchema(t).shape,
        }),
      ),
    });
// #endregion Fixed assets

// #region core
export const trDocSchema = (t: TFunction<'accounting'>) =>
  z
    .discriminatedUnion('journal', [
      transactionMainSchema(t),
      transactionCashSchema(t),
      transactionBankSchema(t),
      transactionReceivableSchema(t),
      transactionPayableSchema(t),

      transactionInvIncomeSchema(t),
      transactionInvOutSchema(t),
      transactionInvJustifySchema(t),
      transactionInvMoveSchema(t),
      transactionInvSaleSchema(t),
      transactionInvSaleReturnSchema(t),

      transactionFxaIncomeSchema(t),
      transactionFxaOutSchema(t),
      transactionFxaMoveSchema(t),
      transactionFxaSaleSchema(t),

      transactionTaxSchema(t),
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
      () => ({
        path: ['vatRow'],
        message: t('select-a-vat-rule-2'),
      }),
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
      () => ({
        path: ['vatAmount'],
        message: t('enter-the-vat-amount'),
      }),
    );
//ctax

// cash

export const transactionGroupSchema = (t: TFunction<'accounting'>) =>
  z.object({
    parentId: undefed(z.string()),
    number: undefed(z.string()),
    ptrNumber: z.string().nullish(),
    contentType: undefed(z.string()),
    contentId: undefed(z.string()),
    date: z.date(),
    status: z.string().refine(
      (val) => TR_STATUSES.ALL.includes(val),
      () => ({
        message: t('select-a-valid-transaction-side'),
      }),
    ),
    mentionOwnerId: z.string().optional(),
    mentionUserIds: z.array(z.string()).optional(),
    trDocs: z.array(trDocSchema(t)).min(1),
  });
// #endregion core
