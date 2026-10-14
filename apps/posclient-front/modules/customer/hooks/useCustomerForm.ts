import { useQuery } from "@apollo/client"

import { CustomerFormField } from "@/types/customer.types"

import { queries } from "../graphql"

interface CustomerFormResponse {
  poscCustomerForm?: {
    canCreate: boolean
    rows: CustomerFormField[][]
  }
}

// The server decides who may add customers and which fields the form shows.
export const useCustomerForm = (skip?: boolean) => {
  const { data, loading } = useQuery<CustomerFormResponse>(
    queries.poscCustomerForm,
    { fetchPolicy: "cache-and-network", skip }
  )

  return {
    canCreate: !!data?.poscCustomerForm?.canCreate,
    rows: data?.poscCustomerForm?.rows || [],
    loading,
  }
}
