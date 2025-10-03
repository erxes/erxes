import { UseFormReturn } from "react-hook-form"
import { BasicInfoFormValues, DeliveryConfigFormValues, FinanceConfigFormValues, FormStepData, PaymentFormValues, PermissionFormValues, ProductFormValues, UiConfigFormValues } from "~/modules/create-pos/components/formSchema"

export interface PermissionSettings {
    adminPrintTempBill: boolean
    adminDirectSales: boolean
    adminDirectDiscountLimit: string
    adminTeamMember: string
  }
  export interface CashierSettings{
    cashierPrintTempBill: boolean
    cashierDirectSales: boolean
    cashierDirectDiscountLimit: string
    cashierTeamMember: string
  }

  export interface ProductGroup {
    name: string
    description: string
    productCategory: string
    excludeProductCategory: string
    excludeProducts: string
  }
  
  export interface ProductServiceSettings {
    productGroups: ProductGroup[]
    initialProductCategory: string
    kioskExcludeCategories: string
    kioskExcludeProducts: string
    remainderConfigEnabled: boolean
    excludeCategories: string
    banFractions: boolean
  }
  export interface ScreenConfigSettings {
    kitchenScreenEnabled: boolean
    showTypes: string
    statusChange: string
    watchingScreenEnabled: boolean
    changeType: string
    changeCount: string
    contentUrl: string
    printEnabled: boolean
  }

  export interface EbarimtConfigSettings {
    companyName: string
    ebarimtUrl: string
    checkTaxpayerUrl: string
    companyRd: string
    merchantin: string
    posno: string
    districtCode: string
    branchNo: string
    defaultGsCode: string
    hasVat: boolean
    vatPercent: string
    hasUbCityTax: boolean
    ubCityTaxPercent: string
    anotherRuleOfProductsOnCityTax: string
    headerText: string
    footerText: string
    hasCopy: boolean
  }

  export interface DeliveryConfigSettings {
    board: string
    pipeline: string
    stage: string
    watchedUsers: string
    assignedUsers: string
    deliveryProduct: string
  }

  export interface SyncCardConfig {
    title: string
    branch: string
    stageBoard: string
    pipeline: string
    stage: string
    assignedUsers: string
    mapField: string
  }
  
  export interface SyncCardSettings {
    showNewConfig: boolean
    configs: SyncCardConfig[]
    currentConfig: SyncCardConfig
  }

  export interface FinanceConfigSettings {
    isSyncErkhet: boolean
    checkErkhet: boolean
    checkInventories: boolean
    userEmail: string
    beginBillNumber: string
    defaultPay: string
    account: string
    location: string
  }
  export interface Branch {
    id: string;
    name: string;
  }
  
  export interface Department {
    id: string;
    name: string;
  }

export interface PaymentMethod {
    _id?: string 
    type: string
    title: string
    icon: string
    config: string 
  }

export interface UsePosCreateHandlersProps {
    forms: {
      basicInfo: UseFormReturn<BasicInfoFormValues>;
      permission: UseFormReturn<PermissionFormValues>;
      product: UseFormReturn<ProductFormValues>;
      payment: UseFormReturn<PaymentFormValues>;
      uiConfig?: UseFormReturn<UiConfigFormValues>;
      deliveryConfig?: UseFormReturn<DeliveryConfigFormValues>;
      financeConfig?: UseFormReturn<FinanceConfigFormValues>;
    };
    formStepData: FormStepData;
  }
  
export interface SlotData {
    code: string;
    name: string;
    posId: string;
    option: {
      width: number;
      height: number;
      top: number;
      left: number;
      rotateAngle: number;
      borderRadius: number;
      color: string;
      zIndex: number;
      isShape: boolean;
    };
  }