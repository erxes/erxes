import { IUser } from '@/pos/types/pos';

export interface IScreenConfig {
  isActive: boolean;
  isPrint?: boolean;
  type: string;
  value: number;
  contentUrl?: string;
  showType?: string;
}

export interface CatProd {
  _id: string;
  categoryId: string;
  code?: string;
  name?: string;
  productId: string;
}

export interface ProductDetail {
  productId?: string;
  categoryId?: string;
  isRequired?: boolean;
}

export interface IPosDetail {
  _id: string;
  name: string;
  description?: string;
  orderPassword?: string;
  scopeBrandIds?: string[];
  pdomain?: string;
  createdAt: Date;
  productDetails?: ProductDetail[];
  token: string;
  erxesAppToken: string;
  adminIds: string[];
  cashierIds: string[];
  paymentIds: string[];
  paymentTypes: any[];
  user: IUser;
  isOnline: boolean;
  onServer: boolean;
  branchId?: string;
  departmentId?: string;
  allowBranchIds?: string[];
  beginNumber?: string;
  maxSkipNumber?: number;
  waitingScreen: IScreenConfig;
  kioskMachine?: IScreenConfig;
  kitchenScreen: IScreenConfig;
  uiOptions?: any;
  ebarimtConfig: any;
  erkhetConfig: any;
  catProdMappings?: CatProd[];
  initialCategoryIds?: string[];
  kioskExcludeCategoryIds?: string[];
  kioskExcludeProductIds?: string[];
  deliveryConfig?: any;
  cardsConfig?: any;
  checkRemainder?: boolean;
  permissionConfig?: any;
  allowTypes?: string[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  banFractions: boolean;
  branchTitle?: string;
  departmentTitle?: string;
  adminTeamMember?: string;
  adminPrintTempBill?: boolean;
  adminDirectSales?: boolean;
  adminDirectDiscountLimit?: string;
  cashierTeamMember?: string;
  cashierPrintTempBill?: boolean;
  cashierDirectSales?: boolean;
  cashierDirectDiscountLimit?: string;
}
