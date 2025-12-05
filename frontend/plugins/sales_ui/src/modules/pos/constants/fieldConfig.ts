export type FieldContext = 'ecom' | 'pos' | 'res';
export type PosTypeValue = 'ecommerce' | 'restaurant' | 'pos';

export interface FieldConfig {
  ecom: boolean;
  pos: boolean;
  res: boolean;
}

export interface CategoryFieldConfig {
  [fieldName: string]: FieldConfig;
}

export const posTypeToContext = (
  posType: PosTypeValue | string | undefined,
): FieldContext => {
  switch (posType) {
    case 'ecommerce':
      return 'ecom';
    case 'pos':
      return 'pos';
    case 'restaurant':
      return 'res';
    default:
      return 'pos';
  }
};

export const isFieldVisible = (
  fieldName: string,
  posType: PosTypeValue | string | undefined,
): boolean => {
  const context = posTypeToContext(posType);
  const config = FIELD_VISIBILITY_CONFIG[fieldName];
  if (!config) return true;
  return config[context];
};

export const STEP_VISIBILITY_CONFIG: CategoryFieldConfig = {
  properties: { ecom: true, pos: true, res: true },
  slots: { ecom: false, pos: false, res: true },
  payments: { ecom: true, pos: true, res: true },
  permission: { ecom: false, pos: true, res: true },
  product: { ecom: true, pos: true, res: true },
  appearance: { ecom: false, pos: true, res: true },
  screen: { ecom: true, pos: false, res: true },
  ebarimt: { ecom: true, pos: true, res: true },
  finance: { ecom: true, pos: true, res: true },
  delivery: { ecom: true, pos: false, res: true },
  sync: { ecom: true, pos: true, res: true },
};

export const isStepVisible = (
  stepValue: string,
  posType: PosTypeValue | string | undefined,
): boolean => {
  const context = posTypeToContext(posType);
  const config = STEP_VISIBILITY_CONFIG[stepValue];
  if (!config) return true;
  return config[context];
};

export const FIELD_VISIBILITY_CONFIG: CategoryFieldConfig = {
  // General category fields
  name: {
    ecom: true,
    pos: true,
    res: true,
  },
  description: {
    ecom: true,
    pos: true,
    res: true,
  },
  maxSkipNumber: {
    ecom: false,
    pos: true,
    res: true,
  },
  orderPassword: {
    ecom: false,
    pos: false,
    res: true,
  },
  brand: {
    ecom: true,
    pos: false,
    res: true,
  },
  allowTypes: {
    ecom: false,
    pos: false,
    res: true,
  },
  chooseBranch: {
    ecom: true,
    pos: true,
    res: true,
  },
  chooseDepartment: {
    ecom: true,
    pos: true,
    res: true,
  },
  isOnline: {
    ecom: true,
    pos: false,
    res: false,
  },
  onServer: {
    ecom: false,
    pos: true,
    res: true,
  },
  allowBranches: {
    ecom: true,
    pos: true,
    res: true,
  },
  posDomain: {
    ecom: true,
    pos: false,
    res: true,
  },
  beginNumber: {
    ecom: true,
    pos: false,
    res: true,
  },

  // Payments category fields
  choosePayment: {
    ecom: true,
    pos: true,
    res: true,
  },

  appToken: {
    ecom: true,
    pos: false,
    res: true,
  },

  addCustomPayment: {
    ecom: true,
    pos: true,
    res: true,
  },

  // Permission category fields
  admin: {
    ecom: false,
    pos: true,
    res: true,
  },
  cashier: {
    ecom: false,
    pos: true,
    res: true,
  },

  // Product & Service category fields
  productGroups: {
    ecom: true,
    pos: true,
    res: true,
  },
  initialProductCategories: {
    ecom: false,
    pos: true,
    res: true,
  },
  kioskExcludeProducts: {
    ecom: false,
    pos: false,
    res: true,
  },
  productCategoryMapping: {
    ecom: true,
    pos: true,
    res: true,
  },
  remainderConfigs: {
    ecom: false,
    pos: true,
    res: true,
  },

  // Appearance category fields

  logosFavicon: {
    ecom: false,
    pos: true,
    res: true,
  },

  posMainLogo: {
    ecom: false,
    pos: false,
    res: true,
  },

  backgroundImage: {
    ecom: false,
    pos: false,
    res: true,
  },

  receiptIcon: {
    ecom: false,
    pos: false,
    res: true,
  },

  kioskHeader: {
    ecom: false,
    pos: false,
    res: true,
  },

  mobileAppImage: {
    ecom: false,
    pos: false,
    res: true,
  },

  qrCodeImage: {
    ecom: false,
    pos: false,
    res: true,
  },

  mainColors: {
    ecom: false,
    pos: true,
    res: true,
  },

  websitePhone: {
    ecom: false,
    pos: false,
    res: true,
  },

  // Screen Config category fields
  kitchenScreen: {
    ecom: true,
    pos: false,
    res: true,
  },

  waitingScreen: {
    ecom: true,
    pos: false,
    res: true,
  },

  printScreen: {
    ecom: true,
    pos: false,
    res: true,
  },

  // Ebarimt Config category fields

  ebarimtSetup: {
    ecom: true,
    pos: true,
    res: true,
  },

  // Finance Config category fields

  erkhetSetup: {
    ecom: true,
    pos: true,
    res: true,
  },

  remainderInventorySync: {
    ecom: false,
    pos: true,
    res: true,
  },

  // Delivery Config category fields

  deliveryAutomation: {
    ecom: true,
    pos: false,
    res: true,
  },

  deliveryProduct: {
    ecom: true,
    pos: false,
    res: true,
  },

  // Sync Cards category fields

  branchPipelineMapping: {
    ecom: true,
    pos: true,
    res: true,
  },
};
