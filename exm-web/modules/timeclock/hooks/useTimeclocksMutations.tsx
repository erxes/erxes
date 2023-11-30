"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useMutation } from "@apollo/client"
import { useAtomValue } from "jotai"

import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"
import { isCurrentUserAdmin } from "../utils"

export const useTimeclocksMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const currentUser = useAtomValue(currentUserAtom)
  isCurrentUserAdmin(currentUser)

  const [timeclocksRemove, { loading: loadingDelete }] = useMutation(
    mutations.timeclockRemove,
    {
      refetchQueries: ["timeclocksMain"],
    }
  )

  const [timeclockEdit, { loading: loadingEdit }] = useMutation(
    mutations.timeclockEdit,
    {
      refetchQueries: ["timeclocksMain"],
    }
  )

  const [startTimeMutation] = useMutation(mutations.timeclockStart, {
    refetchQueries: ["timeclocksMain"],
  })
  const [stopTimeMutation] = useMutation(mutations.timeclockStop, {
    refetchQueries: ["timeclocksMain"],
  })

  const removeTimeclock = (timeclockId: string) => {
    timeclocksRemove({
      variables: { _id: timeclockId },
    })
      .then(() => {
        callBack("success")
      })
      .catch((e) => {
        callBack("error")
      })
  }

  const editTimeclock = (params: any) => {
    timeclockEdit({
      variables: params,
    })
      .then(() => {
        callBack("success")
      })
      .catch((e) => {
        callBack("error")
      })
  }

  // get current location of an user
  let long = 0
  let lat = 0
  navigator.geolocation.getCurrentPosition((position) => {
    long = position.coords.longitude
    lat = position.coords.latitude
  })

  const startClockTime = (userId: string) => {
    startTimeMutation({
      variables: {
        userId: `${userId}`,
        longitude: long,
        latitude: lat,
        deviceType: "XOS",
      },
    })
      .then(() => {
        callBack("success")
      })
      .catch((error) =>
        toast({ description: error.message, variant: "destructive" })
      )
  }

  const stopClockTime = (userId: string, timeId?: string) => {
    stopTimeMutation({
      variables: {
        _id: timeId,
        userId,
        longitude: long,
        latitude: lat,
        deviceType: "XOS",
      },
    })
      .then(() => {
        callBack("success")
      })
      .catch(() => callBack("error"))
  }

  return {
    removeTimeclock,
    editTimeclock,
    startClockTime,
    stopClockTime,
    loading: loadingDelete || loadingEdit,
  }
}
