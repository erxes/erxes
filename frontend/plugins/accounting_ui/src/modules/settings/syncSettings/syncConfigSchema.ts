import { z } from 'zod';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';

type Translate = (key: string) => string;

const DATE_RULES = ['alwaysNow', 'syncedDateOrNow'] as const;
const RETURN_TYPES = ['fullTr', 'onlySale', 'delete'] as const;
const DEAL_LOCATION_SIDES = ['source', 'destination'] as const;

const withDefault = <T extends z.ZodTypeAny>(fallback: unknown, schema: T) =>
  z.preprocess((value) => value || fallback, schema);

const optionalId = withDefault('', z.string());

const optionalText = z.preprocess(
  (value) => value ?? undefined,
  z.string().optional(),
);

const switchValue = withDefault(false, z.boolean());

const ruleIds = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value : [value];
}, z.array(z.string()).optional());

const requiredId = (t: Translate) =>
  withDefault('', z.string().trim().min(1, t('Required')));

const paymentAccountSchema = z.preprocess(
  (value) => value ?? null,
  z.object({ accountId: optionalId }).nullable(),
);

const getGeneralShape = (t: Translate) => ({
  title: requiredId(t),
  dateRule: withDefault('alwaysNow', z.enum(DATE_RULES)),
  trStatus: optionalText,
});

const getPipelineShape = (t: Translate) => ({
  boardId: optionalText,
  pipelineId: optionalText,
  stageId: requiredId(t),
  responseFieldId: optionalText,
});

const getSaleShape = (t: Translate) => ({
  saleAccountId: requiredId(t),
  saleOutAccountId: requiredId(t),
  saleCostAccountId: requiredId(t),
  branchId: optionalId,
  departmentId: optionalId,
  hasVat: switchValue,
  vatRowId: optionalId,
  reverseVatRules: ruleIds,
  hasCtax: switchValue,
  ctaxRowId: optionalId,
  reverseCtaxRules: ruleIds,
  payments: z.preprocess(
    (value) => value ?? {},
    z.record(
      z.preprocess((value) => value ?? {}, z.object({ accountId: optionalId })),
    ),
  ),
  defaultPayment: paymentAccountSchema,
  defaultNegPayment: paymentAccountSchema,
});

const refineTaxRows =
  (t: Translate) =>
  (
    data: {
      hasVat: boolean;
      vatRowId: string;
      hasCtax: boolean;
      ctaxRowId: string;
    },
    ctx: z.RefinementCtx,
  ) => {
    if (data.hasVat && !data.vatRowId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vatRowId'],
        message: t('VAT row is required'),
      });
    }

    if (data.hasCtax && !data.ctaxRowId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ctaxRowId'],
        message: t('CTAX row is required'),
      });
    }
  };

export const getSyncDealConfigFormSchema = (t: Translate) =>
  z
    .object({
      ...getGeneralShape(t),
      ...getPipelineShape(t),
      ...getSaleShape(t),
    })
    .superRefine(refineTaxRows(t));

export const getSyncDealReturnConfigFormSchema = (t: Translate) =>
  z.object({
    ...getGeneralShape(t),
    ...getPipelineShape(t),
    returnType: withDefault('fullTr', z.enum(RETURN_TYPES)),
    defaultPayment: paymentAccountSchema,
  });

export const getSyncDealMovementConfigFormSchema = (t: Translate) =>
  z.object({
    ...getGeneralShape(t),
    ...getPipelineShape(t),
    sourceAccountId: requiredId(t),
    destinationAccountId: requiredId(t),
    defaultSourceBranchId: optionalText,
    defaultSourceDepartmentId: optionalText,
    defaultDestinationBranchId: optionalText,
    defaultDestinationDepartmentId: optionalText,
    dealLocationSide: withDefault('source', z.enum(DEAL_LOCATION_SIDES)),
  });

export const getSyncOrderConfigFormSchema = (t: Translate) =>
  z
    .object({
      ...getGeneralShape(t),
      posId: requiredId(t),
      returnType: withDefault('fullTr', z.enum(RETURN_TYPES)),
      ...getSaleShape(t),
    })
    .superRefine(refineTaxRows(t));

export type TSyncDealConfigFormValues = z.infer<
  ReturnType<typeof getSyncDealConfigFormSchema>
>;
export type TSyncDealReturnConfigFormValues = z.infer<
  ReturnType<typeof getSyncDealReturnConfigFormSchema>
>;
export type TSyncDealMovementConfigFormValues = z.infer<
  ReturnType<typeof getSyncDealMovementConfigFormSchema>
>;
export type TSyncOrderConfigFormValues = z.infer<
  ReturnType<typeof getSyncOrderConfigFormSchema>
>;

export const getSyncConfigFormSchema = (
  code: ACCOUNTING_SETTINGS_CODES,
  t: Translate,
) => {
  switch (code) {
    case ACCOUNTING_SETTINGS_CODES.SYNC_DEAL:
      return getSyncDealConfigFormSchema(t);
    case ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN:
      return getSyncDealReturnConfigFormSchema(t);
    case ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT:
      return getSyncDealMovementConfigFormSchema(t);
    case ACCOUNTING_SETTINGS_CODES.SYNC_ORDER:
      return getSyncOrderConfigFormSchema(t);
  }
};
