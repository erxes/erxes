export interface IUser {
  _id: string;
  details: {
    avatar: string;
    fullName: string;
    __typename: string;
  };
  __typename: string;
}

export interface CatProdMapping {
  _id: string;
  categoryId: string;
  code?: string;
  name?: string;
  productId: string;
}

export interface UiColors {
  bodyColor?: string;
  headerColor?: string;
  footerColor?: string;
}

export interface UiTexts {
  website?: string;
  phone?: string;
}

export interface UiOptions {
  colors?: UiColors;
  logo?: string;
  bgImage?: string;
  favIcon?: string;
  receiptIcon?: string;
  kioskHeaderImage?: string;
  mobileAppImage?: string;
  qrCodeImage?: string;
  texts?: UiTexts;
}

export interface KitchenScreen {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  showType?: string;
  value?: string;
}

export interface WaitingScreen {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  contentUrl?: string;
  value?: string;
}

export interface EbarimtConfig {
  companyName?: string;
  ebarimtUrl?: string;
  checkTaxpayerUrl?: string;
  checkCompanyUrl?: string;
  hasVat?: boolean;
  hasCitytax?: boolean;
  defaultPay?: string;
  districtCode?: string;
  companyRD?: string;
  defaultGSCode?: string;
  vatPercent?: number;
  cityTaxPercent?: number;
  headerText?: string;
  footerText?: string;
  hasCopy?: boolean;
  hasSumQty?: boolean;
  reverseCtaxRules?: string[];
  reverseVatRules?: string[];
  merchantTin?: string;
  posNo?: string;
  branchNo?: string;
}

export interface ErkhetConfig {
  isSyncErkhet?: boolean;
  userEmail?: string;
  defaultPay?: string;
  getRemainder?: boolean;
  beginNumber?: string;
  location?: string;
  account?: string;
  checkErkhet?: boolean;
  checkInventories?: boolean;
}

export interface DeliveryConfig {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  watchedUserIds?: string[];
  assignedUserIds?: string[];
  productId?: string;
  mapCustomField?: string;
}

export interface IPos {
  _id: string;
  name: string;
  description?: string;
  isOnline: boolean;
  type: string;
  onServer: boolean;
  branchTitle: string;
  branchId?: string;
  allowBranchIds?: string[];
  departmentId?: string;
  departmentTitle: string;
  createdAt: string;
  createdBy: string;
  logo?: string;
  user: IUser;
  initialCategoryIds?: string[];
  kioskExcludeCategoryIds?: string[];
  kioskExcludeProductIds?: string[];
  catProdMappings?: CatProdMapping[];
  isCheckRemainder?: boolean;
  checkExcludeCategoryIds?: string[];
  banFractions?: boolean;
  uiOptions?: UiOptions;
  kitchenScreen?: KitchenScreen;
  waitingScreen?: WaitingScreen;
  ebarimtConfig?: EbarimtConfig;
  erkhetConfig?: ErkhetConfig;
  deliveryConfig?: DeliveryConfig;
  cardsConfig?: Record<string, any>;
  allowTypes?: string[];
  maxSkipNumber?: number;
  orderPassword?: string;
  scopeBrandIds?: string[];
  pdomain?: string;
  beginNumber?: string;
  paymentIds?: string[];
  paymentTypes?: Array<{
    _id?: string;
    type: string;
    title: string;
    icon: string;
    config?: string;
  }>;
  erxesAppToken?: string;
  adminIds?: string[];
  cashierIds?: string[];
  permissionConfig?: {
    admins?: {
      isTempBill?: boolean;
      directDiscount?: boolean;
      directDiscountLimit?: number;
    };
    cashiers?: {
      isTempBill?: boolean;
      directDiscount?: boolean;
      directDiscountLimit?: number;
    };
  };
}
