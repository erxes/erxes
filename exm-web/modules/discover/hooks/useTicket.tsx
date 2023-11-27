import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useTicket = (id: string) => {
  const {
    data: ticketData,
    loading: ticketLoading,
    error: ticketError,
  } = useQuery(queries.ticketDetail, {
    variables: {
      _id: id,
    },
  })

  const ticketDetail = (ticketData || {}).ticketDetail
    ? (ticketData || {}).ticketDetail
    : {}
  return {
    ticketDetail,
    loading: ticketLoading,
  }
}
