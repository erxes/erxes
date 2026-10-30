import { Customer } from "./customer.types"

export interface PaidSum {
  _id?: string
  kind?: string
  kindOfVal: number
  value?: number
  amount?: number
}

export interface Detail {
  terminalResults?: CoverTerminalResult[]
  _id: string | number
  paidType: string
  paidSummary: PaidSum[]
  paidDetail?: string | number
}

export interface Cover {
  beginDate: Date
  endDate: Date
  details?: Detail[]
  _id: string
  status: "draft" | "confirm" | "confirming" | "new" | "unconfirm" | "reconf"
  createdUser: Customer
  modifiedUser?: Customer
  description?: string
}

export interface CoverTerminalResult {
  _id: string
  bank: string
  response?: string | null
  createdAt: string
}
