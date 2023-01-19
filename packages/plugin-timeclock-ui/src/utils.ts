import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import dayjs from 'dayjs';
import { ISchedule } from './types';

const timeFormat = 'HH:mm';

export const compareStartAndEndTime = (
  scheduleDates: ISchedule,
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
