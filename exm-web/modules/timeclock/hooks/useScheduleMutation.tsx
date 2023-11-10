"use client"

import { useMutation } from "@apollo/client"

import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

export const useScheduleMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const [scheduleConfigOrderEditMutation, { loading: loadingEdit }] =
    useMutation(mutations.scheduleConfigOrderEdit, {
      refetchQueries: ["scheduleConfigOrder"],
    })

  const scheduleConfigOrderEdit = (variables: any) => {
    scheduleConfigOrderEditMutation({
      variables,
    })
      .then((res) => {
        toast({ description: `Successfully saved schedule configs order` })
      })
      .catch((error) => {
        toast({ description: error.message, variant: "destructive" })
      })
  }

  return {
    scheduleConfigOrderEdit,

    loading: loadingEdit,
  }
}
