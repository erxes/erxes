import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import dayjs from 'dayjs';
import { IScheduleForm } from './types';

const timeFormat = 'HH:mm';

export const compareStartAndEndTime = (
  scheduleDates: IScheduleForm,
  day_key,
  newShiftStart?,
  newShiftEnd?,
  shiftDate?
) => {
  const currShift = scheduleDates[day_key];
  const currShiftDate = shiftDate
    ? shiftDate
    : currShift
    ? currShift.shiftDate
      ? currShift.shiftDate.toLocaleDateString()
      : currShift.shiftStart?.toLocaleDateString()
    : newShiftStart.toLocaleDateString();

  const currShiftEnd = newShiftEnd ? newShiftEnd : currShift.shiftEnd;
  const currShiftStart = newShiftStart ? newShiftStart : currShift.shiftStart;

  let overnightShift = false;
  let correctShiftEnd;

  if (
    dayjs(currShiftEnd).format(timeFormat) <
    dayjs(currShiftStart).format(timeFormat)
  ) {
    correctShiftEnd = dayjs(
      dayjs(currShiftDate)
        .add(1, 'day')
        .toDate()
        .toLocaleDateString() +
        ' ' +
        dayjs(currShiftEnd).format(timeFormat)
    ).toDate();

    overnightShift = true;
  } else {
    correctShiftEnd = dayjs(
      currShiftDate + ' ' + dayjs(currShiftEnd).format(timeFormat)
    ).toDate();
  }

  const correctShiftStart = dayjs(
    currShiftDate + ' ' + dayjs(currShiftStart).format(timeFormat)
  ).toDate();

  return [correctShiftStart, correctShiftEnd, overnightShift];
};

export const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || {}),
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userIds: queryParams.userIds,
  departmentIds: queryParams.departmentIds,
  branchIds: queryParams.branchIds
});

export const returnDeviceTypes = deviceType => {
  let checkInDevice;
  let checkOutDevice;
  const getDeviceNames = deviceType && deviceType.split('x');

  if (getDeviceNames) {
    if (getDeviceNames.length === 2) {
      checkInDevice = getDeviceNames[0];
      checkOutDevice = getDeviceNames[1];
    } else {
      checkInDevice = getDeviceNames[0];
      checkOutDevice = getDeviceNames[0];
    }
  }

  return [checkInDevice, checkOutDevice];
};
