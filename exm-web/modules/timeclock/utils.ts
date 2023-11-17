import dayjs from "dayjs"

import { IScheduleForm } from "./types"

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
  day_key: any,
  newShiftStart?: Date,
  newShiftEnd?: Date,
  shiftDate?: Date
) => {
  const currShift = scheduleDates[day_key]
  const currShiftDate = shiftDate
    ? shiftDate
    : currShift
    ? currShift.shiftDate
      ? currShift.shiftDate.toLocaleDateString()
      : currShift.shiftStart?.toLocaleDateString()
    : newShiftStart?.toLocaleDateString()

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
  newShiftStart?: Date,
  newShiftEnd?: Date,
  shiftDate?: Date
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
