export type CustomerType = "" | "user" | "company"

export interface CustomerFormOption {
  label: string
  value: string
}

export interface CustomerFormField {
  code: string
  name: string
  type: string
  isSystem: boolean
  options?: CustomerFormOption[]
}

export type CustomerFormValue = string | number | boolean | string[]

export interface CustomerLoyaltyWallet {
  accountTypeId: string
  name?: string | null
  balance: number
  pending: number
  tier?: { key: string; name: string } | null
  expiringSoon?: { amount: number; expiresAt: string } | null
}

export interface CustomerLoyaltyVoucher {
  _id: string
  title: string
  voucherType: string
  kind?: "amount" | "percent" | null
  value?: number | null
  expiresAt?: string | null
  autoApplied: boolean
  applicable: boolean
  reason?: string | null
}

export interface CustomerLoyalty {
  accountNumber?: string | null
  status?: string | null
  wallets: CustomerLoyaltyWallet[]
  vouchers: CustomerLoyaltyVoucher[]
}

export interface Customer {
  _id: string
  code?: string
  primaryPhone?: string
  firstName?: string
  primaryEmail?: string
  lastName?: string
  email?: string
}
