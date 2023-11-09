"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IAttachment } from "@/modules/types"
import { useMutation } from "@apollo/client"
import { useAtomValue } from "jotai"

import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

export const useAbsenceMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const currentUser = useAtomValue(currentUserAtom)

  const [checkInOutRequestMutation, { loading: loadingCheckInOut }] =
    useMutation(mutations.submitCheckInOutRequest, {
      refetchQueries: ["requestsMain", "timeclocksMain"],
    })

  const [removeAbsenceMutation, { loading: loadingDelete }] = useMutation(
    mutations.removeAbsenceRequest,
    {
      refetchQueries: ["requestsMain"],
    }
  )

  const [solveAbsenceMutation, { loading: loadingSolve }] = useMutation(
    mutations.solveAbsenceRequest,
    {
      refetchQueries: ["requestsMain"],
    }
  )

  const [sendAbsenceRequestMutation, { loading: loadingRequest }] = useMutation(
    mutations.sendAbsenceRequest,
    {
      refetchQueries: ["requestsMain"],
    }
  )

  const checkInOutRequest = (
    checkType: string,
    userId: string,
    checkTime: Date
  ) => {
    checkInOutRequestMutation({
      variables: {
        checkType,
        userId,
        checkTime,
      },
    })
      .then((res) => {
        toast({ description: `Successfully sent ${checkType} request` })
      })
      .catch((error) => {
        toast({ description: error.message, variant: "destructive" })
      })
  }

  const removeAbsence = (absenceId: string) => {
    removeAbsenceMutation({
      variables: {
        _id: absenceId,
      },
    })
      .then((res) => {
        callBack("success")
        toast({ description: `Successfully removed absence request` })
      })
      .catch((error) => {
        toast({ description: error.message, variant: "destructive" })
      })
  }

  const solveAbsence = (values: any) => {
    solveAbsenceMutation({
      variables: { variables: values },
    })
      .then((res) => {
        toast({ description: `Successfully solved absence request` })
      })
      .catch((error) => {
        toast({ description: error.message, variant: "destructive" })
      })
  }

  const sendAbsenceRequest = (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    submitTime: any,
    absenceTypeId: string,
    absenceTimeType: string,
    totalHoursOfAbsence: string
  ) => {
    const checkAttachment = attachment?.url.length ? attachment : undefined

    if (absenceTimeType === "by day") {
      const sortedRequestDates = submitTime.requestDates.sort()

      sendAbsenceRequestMutation({
        variables: {
          userId,
          requestDates: submitTime.requestDates,
          reason,
          startTime: new Date(sortedRequestDates[0]),
          endTime: new Date(sortedRequestDates.slice(-1)),
          explanation,
          attachment: checkAttachment,
          absenceTypeId,
          absenceTimeType,
          totalHoursOfAbsence,
        },
      })
        .then((res) => {
          callBack("success")

          toast({ description: `Successfully sent an absence request'` })
        })
        .catch((error) => {
          toast({ description: error.message, variant: "destructive" })
        })

      return
    }
    // by time
    sendAbsenceRequestMutation({
      variables: {
        userId,
        startTime: submitTime.startTime,
        endTime: submitTime.endTime,
        reason,
        explanation,
        attachment: checkAttachment,
        absenceTypeId,
        absenceTimeType,
        totalHoursOfAbsence,
      },
    })
      .then((res) => {
        callBack("success")

        toast({ description: `Successfully sent an absence request'` })
      })
      .catch((error) => {
        toast({ description: error.message, variant: "destructive" })
      })
  }

  return {
    sendAbsenceRequest,
    solveAbsence,
    removeAbsence,
    checkInOutRequest,
    loading:
      loadingCheckInOut || loadingDelete || loadingSolve || loadingRequest,
  }
}
