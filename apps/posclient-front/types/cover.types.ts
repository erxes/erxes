import { Customer } from "./customer.types"

export interface PaidSum {
  _id?: string
  kind?: string
  kindOfVal: number
  value?: number
  amount?: number
}

export interface Detail {
  _id: string | number
  paidType: string
  paidSummary: PaidSum[]
  paidDetail?: string | number
}

export interface CoverAmounts {}

export interface Cover {
  beginDate: Date
  endDate: Date
  details?: Detail[]
  _id: string
  status: "confirm" | "new" | "unconfirm"
  createdUser: Customer
  modifiedUser?: Customer
  description?: string
}
