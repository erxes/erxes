import { IUser } from "@erxes/ui/src/auth/types"
import dayjs from "dayjs"

import { IScheduleForm } from "./types"

// import { generatePaginationParams } from "@erxes/ui/src/utils/router"
// import dayjs from "dayjs"

// import { dateFormat } from "./constants"
// import { IScheduleForm } from "./types"

// const timeFormat = "HH:mm"

// export const compareStartAndEndTime = (
//   scheduleDates: IScheduleForm,
//   day_key,
//   newShiftStart?,
//   newShiftEnd?,
//   shiftDate?
// ) => {
//   const currShift = scheduleDates[day_key]
//   const currShiftDate = shiftDate
//     ? shiftDate
//     : currShift
//     ? currShift.shiftDate
//       ? currShift.shiftDate.toLocaleDateString()
//       : currShift.shiftStart?.toLocaleDateString()
//     : newShiftStart.toLocaleDateString()

//   const currShiftEnd = newShiftEnd ? newShiftEnd : currShift.shiftEnd
//   const currShiftStart = newShiftStart ? newShiftStart : currShift.shiftStart

//   let overnightShift = false
//   let correctShiftEnd

//   if (
//     dayjs(currShiftEnd).format(timeFormat) <
//     dayjs(currShiftStart).format(timeFormat)
//   ) {
//     correctShiftEnd = dayjs(
//       dayjs(currShiftDate).add(1, "day").toDate().toLocaleDateString() +
//         " " +
//         dayjs(currShiftEnd).format(timeFormat)
//     ).toDate()

//     overnightShift = true
//   } else {
//     correctShiftEnd = dayjs(
//       currShiftDate + " " + dayjs(currShiftEnd).format(timeFormat)
//     ).toDate()
//   }

//   const correctShiftStart = dayjs(
//     currShiftDate + " " + dayjs(currShiftStart).format(timeFormat)
//   ).toDate()

//   return [correctShiftStart, correctShiftEnd, overnightShift]
// }
// export const compareStartAndEndTimeOfSingleDate = (
//   newShiftStart?,
//   newShiftEnd?,
//   shiftDate?
// ) => {
//   let overnightShift = false
//   let correctShiftEnd

//   const shiftDateString = dayjs(shiftDate).format(dateFormat)

//   if (
//     dayjs(newShiftEnd).format(timeFormat) <
//     dayjs(newShiftStart).format(timeFormat)
//   ) {
//     correctShiftEnd = dayjs(
//       dayjs(shiftDateString).add(1, "day").toDate().toLocaleDateString() +
//         " " +
//         dayjs(newShiftEnd).format(timeFormat)
//     ).toDate()

//     overnightShift = true
//   } else {
//     correctShiftEnd = dayjs(
//       shiftDateString + " " + dayjs(newShiftEnd).format(timeFormat)
//     ).toDate()
//   }

//   const correctShiftStart = dayjs(
//     shiftDateString + " " + dayjs(newShiftStart).format(timeFormat)
//   ).toDate()

//   return [correctShiftStart, correctShiftEnd, overnightShift]
// }

// export const generateParams = (queryParams) => ({
//   ...generatePaginationParams(queryParams || {}),
//   startDate: queryParams.startDate,
//   endDate: queryParams.endDate,
//   userIds: queryParams.userIds,
//   departmentIds: queryParams.departmentIds,
//   branchIds: queryParams.branchIds,
// })

// export const returnDeviceTypes = (deviceType) => {
//   let checkInDevice
//   let checkOutDevice
//   const getDeviceNames = deviceType && deviceType.split("x")

//   if (getDeviceNames) {
//     if (getDeviceNames.length === 2) {
//       checkInDevice = getDeviceNames[0]
//       checkOutDevice = getDeviceNames[1]
//     } else {
//       checkInDevice = getDeviceNames[0]
//       checkOutDevice = getDeviceNames[0]
//     }
//   }

//   return [checkInDevice, checkOutDevice]
// }

// export const prepareCurrentUserOption = (currentUser: IUser) => {
//   const includeCustomFieldOnSelectLabel = currentUser.employeeId
//     ? currentUser.employeeId
//     : ""

//   const userNameOrEmail =
//     currentUser.details && currentUser.details.fullName
//       ? currentUser.details.fullName
//       : currentUser.email

//   const generateLabel = userNameOrEmail + "\t" + includeCustomFieldOnSelectLabel

//   return {
//     value: currentUser._id,
//     label: generateLabel,
//     avatar: currentUser.details?.avatar,
//   }
// }

export const isCurrentUserAdmin = (currentUser: any) => {
  return (
    (currentUser.permissionActions &&
      currentUser.permissionActions.showTimeclocks &&
      currentUser.permissionActions.manageTimeclocks) ||
    false
  )
}

export const isCurrentUserSupervisor = (currentUser: any) => {
  return (
    (currentUser.permissionActions &&
      currentUser.permissionActions.manageTimeclocks) ||
    false
  )
}

export const returnDeviceTypes = (deviceType: any) => {
  let checkInDevice
  let checkOutDevice
  const getDeviceNames = deviceType && deviceType.split("x")

  if (getDeviceNames) {
    if (getDeviceNames.length === 2) {
      checkInDevice = getDeviceNames[0]
      checkOutDevice = getDeviceNames[1]
    } else {
      checkInDevice = getDeviceNames[0]
      checkOutDevice = getDeviceNames[0]
    }
  }

  return [checkInDevice, checkOutDevice]
}

export const generatePaginationParams = (queryParams: {
  page?: string
  perPage?: string
}) => {
  return {
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
  }
}

export const generateParams = (queryParams: any) => {
  return {
    ...generatePaginationParams(queryParams || {}),
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    userIds: queryParams.userIds,
    departmentIds: queryParams.departmentIds,
    branchIds: queryParams.branchIds,
  }
}

export const compareStartAndEndTime = (
  scheduleDates: IScheduleForm,
  day_key,
  newShiftStart?,
  newShiftEnd?,
  shiftDate?
) => {
  const currShift = scheduleDates[day_key]
  const currShiftDate = shiftDate
    ? shiftDate
    : currShift
    ? currShift.shiftDate
      ? currShift.shiftDate.toLocaleDateString()
      : currShift.shiftStart?.toLocaleDateString()
    : newShiftStart.toLocaleDateString()

  const currShiftEnd = newShiftEnd ? newShiftEnd : currShift.shiftEnd
  const currShiftStart = newShiftStart ? newShiftStart : currShift.shiftStart

  let overnightShift = false
  let correctShiftEnd

  if (
    dayjs(currShiftEnd).format('HH:mm"') <
    dayjs(currShiftStart).format('HH:mm"')
  ) {
    correctShiftEnd = dayjs(
      dayjs(currShiftDate).add(1, "day").toDate().toLocaleDateString() +
        " " +
        dayjs(currShiftEnd).format('HH:mm"')
    ).toDate()

    overnightShift = true
  } else {
    correctShiftEnd = dayjs(
      currShiftDate + " " + dayjs(currShiftEnd).format('HH:mm"')
    ).toDate()
  }

  const correctShiftStart = dayjs(
    currShiftDate + " " + dayjs(currShiftStart).format('HH:mm"')
  ).toDate()

  return [correctShiftStart, correctShiftEnd, overnightShift]
}

export const compareStartAndEndTimeOfSingleDate = (
  newShiftStart?,
  newShiftEnd?,
  shiftDate?
) => {
  let overnightShift = false
  let correctShiftEnd

  const shiftDateString = dayjs(shiftDate).format("MM/DD/YYYY")

  if (
    dayjs(newShiftEnd).format("HH:mm") < dayjs(newShiftStart).format("HH:mm")
  ) {
    correctShiftEnd = dayjs(
      dayjs(shiftDateString).add(1, "day").toDate().toLocaleDateString() +
        " " +
        dayjs(newShiftEnd).format("HH:mm")
    ).toDate()

    overnightShift = true
  } else {
    correctShiftEnd = dayjs(
      shiftDateString + " " + dayjs(newShiftEnd).format("HH:mm")
    ).toDate()
  }

  const correctShiftStart = dayjs(
    shiftDateString + " " + dayjs(newShiftStart).format("HH:mm")
  ).toDate()

  return [correctShiftStart, correctShiftEnd, overnightShift]
}
