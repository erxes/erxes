export interface IFilter {
  searchValue: string
  statuses: string[]
  types?: string[]
  customerId: string | null
  startDate?: string
  endDate?: string
  isPaid?: boolean
  slotCode?: string
  perPage: number
  page: number
  sortField?: string
  sortDirection?: number
  isPreExclude?: boolean
  dueStartDate?: string
  dueEndDate?: string
}
