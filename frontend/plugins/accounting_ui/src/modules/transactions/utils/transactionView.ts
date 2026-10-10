import { z } from 'zod';
import type { AccountingAccTransactionDetailQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
import { CustomerType } from 'ui-modules';
import {
  fxaFollowInfosSchema,
  fxaFollowExtrasSchema,
  fxaIncomeDetailFollowInfoSchema,
  fxaExtraDataSchema,
  invSplitInfoSchema,
  transactionInvIncomeSchema,
} from '../transaction-form/contants/transactionSchema';
import { TrJournalEnum } from '../types/constants';
import { undefed } from '@/types/utils';

const detailFollowSchema = z
  .object({
    invSplit: z.preprocess((value) => {
      if (value === null) return undefined;
      const legacy = z
        .object({
          hasSplit: undefed(z.boolean()),
          productId: undefed(z.string()),
        })
        .passthrough()
        .safeParse(value);
      return legacy.success
        ? {
            ...legacy.data,
            hasSplit: legacy.data.hasSplit ?? Boolean(legacy.data.productId),
          }
        : value;
    }, invSplitInfoSchema.optional()),
    currencyDiffAccountId: undefed(z.string()),
    moveInBranchId: undefed(z.string()),
    moveInDepartmentId: undefed(z.string()),
  })
  .passthrough();
const followSchema = fxaFollowInfosSchema
  .extend({
    moveInAccountId: undefed(z.string()),
    saleTransactionId: undefed(z.string()),
    fixedAssetAccountId: undefed(z.string()),
    lossAccountId: undefed(z.string()),
    responsibleUserId: undefed(z.string()),
    fxaIncomeDetails: undefed(z.array(fxaIncomeDetailFollowInfoSchema)),
    invSplitDetails: undefed(
      z.array(
        z.object({
          detailId: undefed(z.string()),
          productId: undefed(z.string()),
          ratio: undefed(z.number()),
        }),
      ),
    ),
  })
  .passthrough();
const extraSchema = fxaExtraDataSchema
  .extend({
    bank: undefed(z.string()),
    bankAccount: undefed(z.string()),
    discount: undefed(z.number()),
    discountPercent: undefed(z.number()),
    invIncomeExpenses: undefed(
      transactionInvIncomeSchema.shape.extraData.innerType().unwrap().shape
        .invIncomeExpenses,
    ),
  })
  .passthrough();
const relAccountsSchema = z.object({
  dt: undefed(z.array(z.string())),
  ct: undefed(z.array(z.string())),
  customDt: undefed(z.array(z.string())),
  customCt: undefed(z.array(z.string())),
});

type TransactionResult = GraphqlView<
  NonNullable<AccountingAccTransactionDetailQuery['accTransactionDetail']>
>;

// Invalid saved metadata must not become an empty form that overwrites it on save.
const parseMetadata = <Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  field: string,
): z.output<Schema> | undefined => {
  if (value === null || value === undefined) return undefined;
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid saved transaction ${field}: ${result.error.message}`,
    );
  }
  return result.data;
};
export type TransactionDetailView = Omit<
  NonNullable<TransactionResult['details']>[number],
  'followInfos'
> & {
  followInfos?: z.infer<typeof detailFollowSchema>;
  checked?: boolean;
  tempAmount?: number;
};

export const toTransactionView = (
  tr: TransactionResult & { followExtras?: unknown },
) => {
  const journal = z.nativeEnum(TrJournalEnum).safeParse(tr.journal);
  const customerType = z.nativeEnum(CustomerType).safeParse(tr.customerType);
  const followInfos = parseMetadata(
    followSchema,
    tr.followInfos,
    'followInfos',
  );
  const extraData = parseMetadata(extraSchema, tr.extraData, 'extraData');
  const relAccounts = parseMetadata(
    relAccountsSchema,
    tr.relAccounts,
    'relAccounts',
  );
  const followExtras = parseMetadata(
    fxaFollowExtrasSchema,
    tr.followExtras,
    'followExtras',
  );
  const details: TransactionDetailView[] = (tr.details ?? []).map((detail) => {
    return {
      ...detail,
      followInfos: parseMetadata(
        detailFollowSchema,
        detail.followInfos,
        `details.${detail._id}.followInfos`,
      ),
    };
  });
  return {
    ...tr,
    date: tr.date ? new Date(tr.date) : undefined,
    journal: journal.success ? journal.data : undefined,
    customerType: customerType.success ? customerType.data : undefined,
    details,
    followInfos,
    extraData,
    relAccounts,
    followExtras,
  };
};

export const readTransactionViews = (
  transactions: (TransactionResult & { followExtras?: unknown })[] | undefined,
): { transactions?: ReturnType<typeof toTransactionView>[]; error?: Error } => {
  try {
    return { transactions: transactions?.map(toTransactionView) };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error('Invalid saved transaction'),
    };
  }
};
