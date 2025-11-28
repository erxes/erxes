import { atom } from 'jotai';
import {
  CashierSettings,
  DeliveryConfigSettings,
  EbarimtConfigSettings,
  FinanceConfigSettings,
  PermissionSettings,
  ProductServiceSettings,
  ScreenConfigSettings,
  SyncCardSettings,
} from '../types';

export const posCategoryAtom = atom<'restaurant' | 'ecommerce' | 'kiosk'>(
  'restaurant',
);
export const permissionSettingsAtom = atom<PermissionSettings>({
  adminPrintTempBill: false,
  adminDirectSales: false,
  adminDirectDiscountLimit: '',
  adminTeamMember: '',
});
export const cashierSettingsAtom = atom<CashierSettings>({
  cashierPrintTempBill: false,
  cashierDirectSales: false,
  cashierDirectDiscountLimit: '',
  cashierTeamMember: '',
});

export const productServiceSettingsAtom = atom<ProductServiceSettings>({
  productGroups: [],
  initialProductCategory: '',
  kioskExcludeCategories: '',
  kioskExcludeProducts: '',
  remainderConfigEnabled: false,
  excludeCategories: '',
  banFractions: false,
});
export const paymentMethodsAtom = atom<
  Array<{
    type: string;
    title: string;
    icon: string;
    config: string;
  }>
>([]);

export const screenConfigSettingsAtom = atom<ScreenConfigSettings>({
  kitchenScreenEnabled: false,
  showTypes: 'defined',
  statusChange: '',
  watchingScreenEnabled: false,
  changeType: '',
  changeCount: '',
  contentUrl: '',
  printEnabled: false,
});

export const ebarimtConfigSettingsAtom = atom<EbarimtConfigSettings>({
  companyName: '',
  ebarimtUrl: '',
  checkCompanyUrl: '',
  companyRD: '',
  merchantin: '',
  posno: '',
  districtCode: '',
  branchNo: '',
  defaultGSCode: '',
  hasVat: false,
  hasCitytax: false,
  vatPercent: 0,
  ubCityTaxPercent: 0,
  cityTaxPercent: 0,
  anotherRuleOfProductsOnCityTax: [],
  anotherRuleOfProductsOnVat: [],
  defaultPay: 'debtAmount',
  headerText: '',
  footerText: '',
  hasCopy: false,
  hasSummaryQty: false,
  hasSumQty: false,
});

export const deliveryConfigSettingsAtom = atom<DeliveryConfigSettings>({
  board: '',
  pipeline: '',
  stage: '',
  watchedUsers: '',
  assignedUsers: '',
  deliveryProduct: '',
});

export const syncCardSettingsAtom = atom<SyncCardSettings>({
  showNewConfig: false,
  configs: [],
  currentConfig: {
    title: '',
    branch: '',
    stageBoard: '',
    pipeline: '',
    stage: '',
    assignedUsers: '',
    mapField: '',
  },
});

export const financeConfigSettingsAtom = atom<FinanceConfigSettings>({
  isSyncErkhet: false,
  checkErkhet: false,
  checkInventories: false,
  userEmail: '',
  beginBillNumber: '',
  defaultPay: '',
  account: '',
  location: '',
});

export const sidebarViewPerStepAtom = atom<{ [step: string]: string }>({});
export const slotAtom = atom(false);
