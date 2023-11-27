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
        toast({
          description: `Successfully removed timeclock shift`,
          title: `Remove timeclock`,
          variant: "success",
        })
      })
      .catch((error) => {
        toast({
          description: error.message,
          title: `Remove timeclock`,
          variant: "destructive",
        })
      })
  }

  const editTimeclock = (params: any) => {
    timeclockEdit({
      variables: params,
    })
      .then(() => {
        callBack("success")
        toast({
          description: `Successfully edited timeclock shift`,
          title: `Modify timeclock`,
          variant: "success",
        })
      })
      .catch((error) => {
        toast({
          description: error.message,
          title: `Modify timeclock`,
          variant: "destructive",
        })
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
        toast({
          description: "Successfully started a shift",
          title: "Start shift",
          variant: "success",
        })
      })
      .catch((error) =>
        toast({
          description: error.message,
          title: "Start shift",
          variant: "destructive",
        })
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
        toast({
          description: "Successfully started a shift",
          title: "Stop shift",
          variant: "success",
        })
      })
      .catch((error) =>
        toast({
          description: error.message,
          title: "Stop shift",
          variant: "destructive",
        })
      )
  }

  return {
    removeTimeclock,
    editTimeclock,
    startClockTime,
    stopClockTime,
    loading: loadingDelete || loadingEdit,
  }
}
