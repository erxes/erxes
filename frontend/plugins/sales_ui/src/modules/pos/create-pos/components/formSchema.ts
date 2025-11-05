import { z } from 'zod';
import { DEFAULT_ALLOW_TYPE } from '../../constants';

const uiOptionsSchema = z.object({
  colors: z.object({
    bodyColor: z.string().default('#FFFFFF'),
    headerColor: z.string().default('#6569DF'),
    footerColor: z.string().default('#3CCC38'),
  }),
  logo: z.string().default(''),
  bgImage: z.string().default(''),
  favIcon: z.string().default(''),
  receiptIcon: z.string().default(''),
  kioskHeaderImage: z.string().default(''),
  mobileAppImage: z.string().default(''),
  qrCodeImage: z.string().default(''),
});

const productDetailSchema = z.object({
  productId: z.string(),
  categoryId: z.string().optional(),
  isRequired: z.boolean().default(false),
});

const catProdMappingSchema = z.object({
  categoryId: z.string(),
  productIds: z.array(z.string()).default([]),
  productId: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
});

const paymentTypeSchema = z.object({
  _id: z.string().optional(),
  type: z.string(),
  title: z.string(),
  icon: z.string(),
  config: z.string(),
});

export const screenConfigSchema = z.object({
  isActive: z.boolean().default(false),
  isPrint: z.boolean().optional(),
  type: z.string().default(''),
  value: z.number().default(0),
  contentUrl: z.string().optional(),
  showType: z.string().optional(),
});

export const ebarimtConfigSchema = z.object({
  companyRD: z.string().default(''),
  ebarimtUrl: z.string().default(''),
  checkCompanyUrl: z.string().default(''),
  hasVat: z.boolean().default(false),
  hasCityTax: z.boolean().default(false),
  districtCode: z.string().default(''),
  companyName: z.string().default(''),
  defaultGSCode: z.string().default(''),
  vatPercent: z.number().default(0),
  cityTaxPercent: z.number().default(0),
  footerText: z.string().default(''),
});

export const financeConfigSchema = z.object({
  isSyncErkhet: z.boolean().default(false),
  checkErkhet: z.boolean().default(false),
  checkInventories: z.boolean().default(false),
  userEmail: z.string().optional(),
  beginBillNumber: z.string().optional(),
  defaultPay: z.string().optional(),
  account: z.string().optional(),
  location: z.string().optional(),
  getRemainder: z.boolean().default(false),
});

export const posDetailSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  adminIds: z.array(z.string()).min(1, 'At least one admin is required'),
  cashierIds: z.array(z.string()).min(1, 'At least one cashier is required'),
  productDetails: z.array(productDetailSchema).default([]),
  paymentIds: z.array(z.string()).default([]),
  paymentTypes: z.array(paymentTypeSchema).default([]),
  uiOptions: uiOptionsSchema.default({
    colors: {
      bodyColor: '#FFFFFF',
      headerColor: '#6569DF',
      footerColor: '#3CCC38',
    },
    logo: '',
    bgImage: '',
    favIcon: '',
    receiptIcon: '',
    kioskHeaderImage: '',
    mobileAppImage: '',
    qrCodeImage: '',
  }),
  catProdMappings: z.array(catProdMappingSchema).default([]),
  branchId: z.string().optional(),
  beginNumber: z.string().default(''),
  maxSkipNumber: z.number().min(0).default(5),
  scopeBrandIds: z.array(z.string()).default([]),
  initialCategoryIds: z.array(z.string()).default([]),
  kioskExcludeCategoryIds: z.array(z.string()).default([]),
  kioskExcludeProductIds: z.array(z.string()).default([]),
  checkRemainder: z.boolean().default(false),
  permissionConfig: z.record(z.any()).default({}),
  allowTypes: z
    .array(z.enum(['eat', 'take', 'delivery', 'loss', 'spend', 'reject']))
    .default([DEFAULT_ALLOW_TYPE, 'take', 'delivery']),
  checkExcludeCategoryIds: z.array(z.string()).default([]),
  departmentId: z.string().optional(),
});

export type PosDetailFormValues = z.infer<typeof posDetailSchema>;

export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  allowTypes: z
    .array(z.enum(['eat', 'take', 'delivery', 'loss', 'spend', 'reject']))
    .min(1, 'At least one type is required'),
  scopeBrandIds: z.array(z.string()).default([]),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
});

export const permissionSchema = z.object({
  adminTeamMember: z.string().min(1, 'Admin team member is required'),
  adminPrintTempBill: z.boolean().default(false),
  adminDirectSales: z.boolean().default(false),
  adminDirectDiscountLimit: z.string().default(''),

  cashierTeamMember: z.string().min(1, 'Cashier team member is required'),
  cashierPrintTempBill: z.boolean().default(false),
  cashierDirectSales: z.boolean().default(false),
  cashierDirectDiscountLimit: z.string().default(''),

  adminIds: z.array(z.string()).default([]),
  cashierIds: z.array(z.string()).default([]),
  permissionConfig: z.record(z.any()).default({}),
});

const productGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  excludedCategoryIds: z.array(z.string()).optional(),
  excludedProductIds: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  productDetails: z.array(productDetailSchema).default([]),
  catProdMappings: z.array(catProdMappingSchema).default([]),
  initialCategoryIds: z.array(z.string()).default([]),
  kioskExcludeCategoryIds: z.array(z.string()).default([]),
  kioskExcludeProductIds: z.array(z.string()).default([]),
  checkExcludeCategoryIds: z.array(z.string()).default([]),
  productGroups: z.array(productGroupSchema).default([]),
});

export const paymentSchema = z.object({
  paymentIds: z.array(z.string()).default([]),
  paymentTypes: z.array(paymentTypeSchema).default([]),
});

export const uiConfigSchema = z.object({
  uiOptions: uiOptionsSchema,
  beginNumber: z.string().default(''),
  maxSkipNumber: z.number().min(0).default(5),
  checkRemainder: z.boolean().default(false),
});

export const deliveryConfigSchema = z.object({
  boardId: z.string().optional(),
  pipeline: z.string().optional(),
  stage: z.string().optional(),
  watchedUsers: z.string().optional(),
  assignedUsers: z.string().optional(),
  deliveryProduct: z.string().optional(),
  watchedUserIds: z.array(z.string()).default([]),
  assignedUserIds: z.array(z.string()).default([]),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type PermissionFormValues = z.infer<typeof permissionSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type UiConfigFormValues = z.infer<typeof uiConfigSchema>;
export type DeliveryConfigFormValues = z.infer<typeof deliveryConfigSchema>;
export type FinanceConfigFormValues = z.infer<typeof financeConfigSchema>;
export type ScreenConfigFormValues = z.infer<typeof screenConfigSchema>;
export type EbarimtConfigFormValues = z.infer<typeof ebarimtConfigSchema>;

export interface FormStepData {
  basicInfo?: BasicInfoFormValues;
  permission?: PermissionFormValues;
  product?: ProductFormValues;
  payment?: PaymentFormValues;
  uiConfig?: UiConfigFormValues;
  deliveryConfig?: DeliveryConfigFormValues;
  financeConfig?: FinanceConfigFormValues;
  screenConfig?: ScreenConfigFormValues;
  ebarimtConfig?: EbarimtConfigFormValues;
}

export const combineFormData = (
  stepData: FormStepData,
): Partial<PosDetailFormValues> => {
  return {
    ...stepData.basicInfo,
    ...stepData.permission,
    ...stepData.product,
    ...stepData.payment,
    ...stepData.uiConfig,
    ...stepData.deliveryConfig,
    ...stepData.financeConfig,
    ...stepData.screenConfig,
    ...stepData.ebarimtConfig,
  };
};
