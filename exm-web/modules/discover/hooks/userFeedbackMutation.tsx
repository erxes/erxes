import { useMutation } from "@apollo/client"

import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const userFeedbackMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const [ticketsAdd, { loading: loadingTicket }] = useMutation(
    mutations.ticketsAdd,
    {
      refetchQueries: ["tickets", "ticketsTotalCount"],
    }
  )

  const addTickets = (params: any) => {
    ticketsAdd({
      variables: { ...params, proccessId: Math.random().toString() },
    })
      .then(() => {
        toast({
          title: `Send feedback`,
          description: `Successfully sent your feedback`,
          variant: "success",
        })

        callBack("success")
      })
      .catch((error) => {
        toast({
          description: error.message,
          title: `Send feedback`,
          variant: "destructive",
        })
      })
  }

  return {
    addTickets,

    loading: loadingTicket,
  }
}

export default userFeedbackMutation
