import { IOrderType } from "./order.types"

export interface IUIOptions {
  colors?: string
  logo?: string
  favIcon?: string
  receiptIcon?: string
  bgImage?: string
  kioskHeaderImage?: string
  texts?: {
    phone?: string
    website?: string
  }
}

export interface IConfig {
  _id: string
  name: string
  token: string
  cashierIds?: string[]
  adminIds?: string[]
  createdAt?: string
  description?: string
  waitingScreen?: {
    isActive?: boolean
    value?: string
    type?: string
  }
  erxesAppToken?: string
  kitchenScreen?: IKitchenScreen
  uiOptions?: IUIOptions
  paymentTypes?: IPaymentType[]
  paymentIds?: string[]
  allowTypes: IOrderType[]
  orderPassword?: string
  banFractions?: boolean
  permissionConfig?: {
    admins?: IPermissionConfig
    cashiers?: IPermissionConfig
  }
  initialCategoryIds?: string[]
  ebarimtConfig?: IEbarimtConfig
  branchId: string
  departmentId: string
}

export interface IEbarimtConfig {
  headerText?: string
  footerText?: string
  hasCopy?: boolean
  ebarimtUrl?: string
  companyRD?: string
  companyName?: string
}

export interface IPaymentType {
  _id: string
  type: string
  title: string
  config?: {
    [key: string]: string
    port: string
    notSplit: string
  }
}

export interface IKitchenScreen {
  isActive?: boolean
  isPrint?: boolean
}

export interface IPermissionConfig {
  isTempBill?: boolean
  directDiscount?: boolean
  directDiscountLimit?: number
}

export interface ICurrentUser {
  _id: string
  createdAt?: string
  username?: string
  email?: string
  isOwner?: boolean
  details: {
    avatar?: null
    fullName?: string
    shortName?: string
    position?: string
    description?: string
    operatorPhone?: string
  }
}

export type modeT =
  | "market"
  | "main"
  | "kiosk"
  | "coffee-shop"
  | "restaurant"
  | "mobile"
