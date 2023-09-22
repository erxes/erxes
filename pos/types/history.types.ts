import { IOrderStatus } from "./order.types"

export interface IFilter {
  searchValue: string
  statuses: string[]
  customerId: string | null
  startDate: string | undefined
  endDate: string | undefined
  isPaid: boolean | undefined
  perPage: number
  page: number
  sortField: string | undefined
  sortDirection: number | undefined
}
