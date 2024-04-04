"use client"

import { useMutation } from "@apollo/client"
import dayjs from "dayjs"

import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"
import { ISchedule } from "../types"

export const useScheduleMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const [scheduleConfigOrderEditMutation, { loading: loadingEdit }] =
    useMutation(mutations.scheduleConfigOrderEdit, {
      refetchQueries: ["scheduleConfigOrder"],
    })

  const [checkDuplicateScheduleShiftsMutation, { loading: loadingCheck }] =
    useMutation(mutations.checkDuplicateScheduleShifts)
  const [sendScheduleReqMutation, { loading: loadingRequest }] = useMutation(
    mutations.sendScheduleRequest,
    {
      refetchQueries: ["schedulesMain"],
    }
  )

  const scheduleConfigOrderEdit = (variables: any) => {
    scheduleConfigOrderEditMutation({
      variables,
    })
      .then((res) => {
        toast({
          description: `Successfully saved schedule configs order`,
          title: `Schedule configs order`,
          variant: "success",
        })
      })
      .catch((error) => {
        toast({
          description: error.message,
          title: `Schedule configs order`,
          variant: "destructive",
        })
      })
  }

  const submitRequest = (variables: any) => {
    const userId = `${variables.userIds}`
    sendScheduleReqMutation({
      variables: {
        userId,
        ...variables,
      },
    })
      .then(() => {
        toast({
          description: "Successfully sent a schedule request",
          title: `Schedule request`,
          variant: "success",
        })
        callBack("success")
      })
      .catch((err) =>
        toast({
          description: err.message,
          title: `Schedule request`,
          variant: "destructive",
        })
      )
  }

  const checkDuplicateScheduleShifts = async (variables: any) => {
    const { checkOnly } = variables
    let duplicateSchedules: ISchedule[] = []

    const res = await checkDuplicateScheduleShiftsMutation({
      variables,
    })

    duplicateSchedules = await res.data.checkDuplicateScheduleShifts
    if (!duplicateSchedules.length) {
      toast({
        description: "No duplicate schedules",
        title: `Check duplicate`,
        variant: "success",
      })
      if (checkOnly) {
        return duplicateSchedules
      }
      submitRequest(variables)
    }

    const usersWithDuplicateShifts: {
      [userId: string]: { userInfo: string; shiftInfo: string[] }
    } = {}

    for (const duplicateSchedule of duplicateSchedules) {
      const { user } = duplicateSchedule
      const { details } = user

      const getUserInfo =
        user && details && details.fullName
          ? details.fullName
          : user.email || user.employeeId

      const duplicateShifts: string[] = []

      for (const shift of duplicateSchedule.shifts) {
        const shiftDay = dayjs(shift.shiftStart).format("MM/DD/YYYY")
        const shiftStart = dayjs(shift.shiftStart).format("HH:mm")
        const shiftEnd = dayjs(shift.shiftEnd).format("HH:mm")
        const shiftRequest = duplicateSchedule.solved ? "" : "(Request)"

        duplicateShifts.push(
          `${shiftDay} ${shiftStart} ~ ${shiftEnd} ${shiftRequest} `
        )
      }

      if (user._id in usersWithDuplicateShifts) {
        const prev = usersWithDuplicateShifts[user._id]
        const prevShiftInfo = usersWithDuplicateShifts[user._id].shiftInfo
        usersWithDuplicateShifts[user._id] = {
          ...prev,
          shiftInfo: [...prevShiftInfo, ...duplicateShifts],
        }

        continue
      }

      usersWithDuplicateShifts[user._id] = {
        userInfo: getUserInfo || "-",
        shiftInfo: duplicateShifts,
      }
    }

    const alertMessages: any = []
    for (const userId of Object.keys(usersWithDuplicateShifts)) {
      const displayDuplicateShifts =
        usersWithDuplicateShifts[userId].shiftInfo.join("\n")

      alertMessages.push(
        (toast({
          description: `You has duplicate schedule:\n${displayDuplicateShifts}`,
          title: `Check duplicate`,
          variant: "warning",
        }),
        200000)
      )
    }

    return duplicateSchedules
  }

  return {
    scheduleConfigOrderEdit,
    checkDuplicateScheduleShifts,
    loading: loadingEdit || loadingCheck || loadingRequest,
  }
}
