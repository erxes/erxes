export type CustomerType = "" | "user" | "company"

export interface Customer {
  _id: string
  code?: string
  primaryPhone?: string
  firstName?: string
  primaryEmail?: string
  lastName?: string
  email?: string
}
