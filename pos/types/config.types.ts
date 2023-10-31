export interface IUIOptions {
  colors?: string
  logo?: string
  favIcon?: string
  receiptIcon?: string
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
  }
  kitchenScreen?: IKitchenScreen
  uiOptions?: IUIOptions
}

export interface IPaymentType {
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

export interface IPaymentConfig extends ICoverConfig {
  permissionConfig?: {
    admins?: {
      isTempBill?: boolean
    }
    cashiers?: {
      isTempBill?: boolean
    }
  }
}
export interface ICoverConfig {
  paymentIds: string[]
  paymentTypes: IPaymentType[]
}

export interface IEbarimtConfig {
  ebarimtConfig: {
    footerText: string
    hasCopy: boolean
  }
  paymentTypes: IPaymentType[]
  uiOptions: IUIOptions
  name: string
}

export interface ISettingsConfig {
  branchId: string
  createdAt: string
  departmentId: string
  paymentTypes: IPaymentType[]
  ebarimtConfig: {
    ebarimtUrl: string
    companyRD: string
  }
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

export type modeT = "market" | "main" | "kiosk" | "coffee-shop"
