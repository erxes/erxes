import { fixDate, getPureDate } from '@erxes/api-utils/src';
import * as dayjs from 'dayjs';
import { generateModels, IModels } from '../../connectionResolver';
import {
  IAbsence,
  IAbsenceTypeDocument,
  IScheduleConfigDocument,
  IScheduleDocument,
  IShiftDocument,
  ITeamMembersObj,
  IUserAbsenceInfo,
  IUserReport,
  IUsersReport
} from '../../models/definitions/timeclock';
import { calculateWeekendDays, customFixDate } from '../../utils';

/// milliseconds to mins
const MMSTOMINS = 60000;
// milliseconds to hrs
const MMSTOHRS = MMSTOMINS * 60;
// millieseconds to days
const MMSTODAYS = MMSTOHRS * 24;
const dateFormat = 'YYYY-MM-DD';

export const createScheduleShiftsByUserIds = async (
  userIds: string[],
  shifts,
  models: IModels,
  scheduleConfigId?: string
) => {
  let schedule;
  userIds.forEach(async userId => {
    schedule = await models.Schedules.createSchedule({
      userId,
      solved: true,
      status: 'Approved',
      scheduleConfigId: `${scheduleConfigId}`
    });

    shifts.forEach(shift => {
      models.Shifts.createShift({
        scheduleId: schedule._id,
        shiftStart: shift.shiftStart,
        shiftEnd: shift.shiftEnd,
        solved: true,
        status: 'Approved'
      });
    });
  });

  return schedule;
};
export const timeclockReportByUsers = async (
  userIds: string[],
  models: IModels,
  queryParams: any
): Promise<IUserReport[]> => {
  const returnReport: any[] = [];

  const { startDate, endDate } = queryParams;

  const schedules = await models.Schedules.find({
    userId: { $in: userIds },
    solved: true,
    status: /approved/gi
  });

  // find total Timeclocks
  const timeclocks = await models.Timeclocks.find({
    $and: [
      { userId: { $in: userIds } },
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      }
    ]
  }).sort({ userId: 1 });

  // get all approved absence requests
  const requests = await models.Absences.find({
    userId: { $in: userIds },
    solved: true,
    status: /approved/gi,
    $or: [
      {
        startTime: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      },
      {
        endTime: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      }
    ]
  });

  const absTypeObject: { [id: string]: any } = {};

  const absenceTypes = await models.AbsenceTypes.find({
    _id: { $in: requests.map(r => r.absenceTypeId) }
  });

  for (const absType of absenceTypes) {
    absTypeObject[absType._id] = absType.requestType;
  }

  const requestsFiltered: any = [];
  for (const request of requests) {
    requestsFiltered.push({
      absenceType: absTypeObject[request.absenceTypeId || ''],
      absenceTimeType: request.absenceTimeType,
      requestDates: request.requestDates,
      userId: request.userId,
      solved: request.solved,
      reason: request.reason,
      totalHoursOfAbsence: request.totalHoursOfAbsence,
      startTime: request.startTime,
      endTime: request.endTime
    });
  }

  for (const userId of userIds) {
    returnReport.push({
      userId,
      requests: requestsFiltered.filter(request => request.userId === userId),
      schedules: schedules.filter(schedule => schedule.userId === userId),
      timeclocks: timeclocks.filter(t => t.userId === userId)
    });
  }

  return returnReport;
};

export const returnReportByUserIds = async (
  models: IModels,
  selectedUserIds: string[]
): Promise<[IUserReport[], number, number, number, number]> => {
  let idx = 0;
  const reports: IUserReport[] = [];

  let groupTotalAbsence = 0;
  let groupTotalMinsWorked = 0;
  let groupTotalMinsScheduled = 0;

  for (const userId of selectedUserIds) {
    const schedules = models.Schedules.find({
      userId
    });
    const timeclocks = models.Timeclocks.find({
      userId
    });
    const absences = models.Absences.find({
      userId,
      status: 'Approved'
    });
    const shiftsOfSchedule: any = [];

    for (const { _id } of await schedules) {
      shiftsOfSchedule.push(
        ...(await models.Shifts.find({
          scheduleId: _id,
          status: 'Approved'
        }))
      );
    }

    // if any of the schemas is not empty
    if (
      (await absences).length !== 0 ||
      (await schedules).length !== 0 ||
      (await timeclocks).length !== 0
    ) {
      reports.push({
        userId,
        scheduleReport: []
      });

      let totalMinsWorkedPerUser = 0;
      let totalMinsScheduledPerUser = 0;

      for (const timeclock of await timeclocks) {
        const previousSchedules = reports[idx].scheduleReport;

        const shiftDuration =
          timeclock.shiftEnd &&
          timeclock.shiftStart &&
          Math.round(
            (timeclock.shiftEnd.getTime() - timeclock.shiftStart.getTime()) /
              60000
          );

        totalMinsWorkedPerUser += shiftDuration || 0;
        reports[idx] = {
          ...reports[idx],
          scheduleReport: previousSchedules?.concat({
            date: new Date(timeclock.shiftStart).toDateString(),
            recordedStart: timeclock.shiftStart,
            recordedEnd: timeclock.shiftEnd,
            minsWorked: shiftDuration
          })
        };
      }

      for (const scheduleShift of shiftsOfSchedule) {
        let found = false;
        const scheduleDateString = new Date(
          scheduleShift.shiftStart
        ).toDateString();

        // schedule duration per shift
        const scheduleDuration =
          scheduleShift.shiftEnd &&
          scheduleShift.shiftStart &&
          Math.round(
            (scheduleShift.shiftEnd.getTime() -
              scheduleShift.shiftStart.getTime()) /
              60000
          );

        totalMinsScheduledPerUser += scheduleDuration;
        reports[idx].totalMinsScheduled = totalMinsScheduledPerUser;

        reports[idx].scheduleReport.forEach(
          (recordedShiftOfReport, recorded_shiftIdx) => {
            if (recordedShiftOfReport.date === scheduleDateString) {
              reports[idx].scheduleReport[recorded_shiftIdx] = {
                ...recordedShiftOfReport,
                scheduleStart: scheduleShift.shiftStart,
                scheduleEnd: scheduleShift.shiftEnd
              };
              found = true;
            }
          }
        );

        // if corresponding shift is not found from recorded shifts
        if (!found) {
          reports[idx].scheduleReport?.push({
            date: scheduleDateString,
            scheduleStart: scheduleShift.shiftStart,
            scheduleEnd: scheduleShift.shiftEnd
          });
        }
      }

      // calculate total absent mins per user
      let totalAbsencePerUser = 0;
      for (const absence of await absences) {
        if (absence.startTime && absence.endTime) {
          totalAbsencePerUser +=
            (absence.endTime.getTime() - absence.startTime.getTime()) / 60000;
        }
      }
      reports[idx] = {
        ...reports[idx],
        totalAbsenceMins: Math.trunc(totalAbsencePerUser),
        totalMinsWorked: totalMinsWorkedPerUser
      };

      groupTotalMinsScheduled += totalMinsScheduledPerUser;
      groupTotalMinsWorked += totalMinsWorkedPerUser;
      groupTotalAbsence += Math.trunc(totalAbsencePerUser);
      idx += 1;
    }
  }
  let groupTotalMinsLate = 0;

  //  calculate how many mins late per user
  reports.forEach((userReport, groupReportIdx) => {
    let totalMinsLatePerUser = 0;
    userReport.scheduleReport.forEach((userSchedule, userReportIdx) => {
      if (
        userSchedule.recordedEnd &&
        userSchedule.recordedStart &&
        userSchedule.scheduleEnd &&
        userSchedule.scheduleStart
      ) {
        const shiftStartDiff =
          userSchedule.recordedStart.getTime() -
          userSchedule.scheduleStart.getTime();

        const shiftEndDiff =
          userSchedule.scheduleEnd.getTime() -
          userSchedule.recordedEnd.getTime();

        const sumMinsLate = Math.trunc(
          ((shiftEndDiff > 0 ? shiftEndDiff : 0) +
            (shiftStartDiff > 0 ? shiftStartDiff : 0)) /
            60000
        );

        totalMinsLatePerUser += sumMinsLate;
        userReport.scheduleReport[userReportIdx] = {
          ...userSchedule,
          minsLate: sumMinsLate
        };
      }
    });

    groupTotalMinsLate += totalMinsLatePerUser;
    reports[groupReportIdx] = {
      ...userReport,
      totalMinsLate: totalMinsLatePerUser
    };
  });

  return [
    reports,
    groupTotalMinsLate,
    groupTotalAbsence,
    groupTotalMinsWorked,
    groupTotalMinsScheduled
  ];
};

export const timeclockReportByUser = async (
  userId: string,
  subdomain: string,
  startDate?: string,
  endDate?: string
) => {
  const models = await generateModels(subdomain);

  let report: IUserReport = {
    scheduleReport: [],
    userId,
    totalMinsScheduledThisMonth: 0
  };
  const shiftsOfSchedule: any = [];

  // get 1st of the next Month
  const NOW = new Date();
  const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1);
  // get 1st of this month
  const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);

  const startTime = startDate ? startDate : startOfThisMonth;
  const endTime = endDate ? endDate : startOfNextMonth;

  // get the schedule data of this month
  const schedules = models.Schedules.find({ userId });
  const timeclocks = models.Timeclocks.find({
    $and: [
      { userId },
      {
        shiftStart: {
          $gte: fixDate(startTime),
          $lte: fixDate(endTime)
        }
      },
      {
        shiftEnd: {
          $gte: fixDate(startTime),
          $lte: fixDate(endTime)
        }
      }
    ]
  });
  const absences = models.Absences.find({
    $and: [
      {
        userId,
        status: 'Approved'
      },
      {
        startTime: {
          $gte: fixDate(startTime),
          $lte: fixDate(endTime)
        }
      }
    ]
  });

  for (const { _id } of await schedules) {
    shiftsOfSchedule.push(
      ...(await models.Shifts.find({
        $and: [
          { scheduleId: _id },
          { status: 'Approved' },
          {
            shiftStart: {
              $gte: fixDate(startTime),
              $lte: fixDate(endTime)
            }
          }
        ]
      }))
    );
  }

  // if any of the schemas is not empty
  if (
    (await absences).length !== 0 ||
    (await schedules).length !== 0 ||
    (await timeclocks).length !== 0
  ) {
    let totalMinsWorkedThisMonthPerUser = 0;
    let totalMinsWorkedTodayPerUser = 0;
    for (const timeclock of await timeclocks) {
      const previousSchedules = report.scheduleReport;

      const shiftDuration =
        timeclock.shiftEnd &&
        timeclock.shiftStart &&
        Math.round(
          (timeclock.shiftEnd.getTime() - timeclock.shiftStart.getTime()) /
            60000
        );

      totalMinsWorkedThisMonthPerUser += shiftDuration || 0;
      if (timeclock.shiftStart.toDateString() === NOW.toDateString()) {
        totalMinsWorkedTodayPerUser += shiftDuration || 0;
        report.totalMinsWorkedToday = totalMinsWorkedTodayPerUser;
      }
      report = {
        ...report,
        scheduleReport: previousSchedules?.concat({
          date: new Date(timeclock.shiftStart).toDateString(),
          recordedStart: timeclock.shiftStart,
          recordedEnd: timeclock.shiftEnd,
          minsWorked: shiftDuration
        })
      };
    }

    const totalDaysWorkedThisMonth = new Set(
      (await timeclocks).map(shift =>
        new Date(shift.shiftStart).toLocaleDateString()
      )
    ).size;

    const totalDaysScheduledThisMonth = new Set(
      shiftsOfSchedule.map(shiftOfSchedule =>
        new Date(shiftOfSchedule.shiftStart).toLocaleDateString()
      )
    ).size;

    report.totalDaysScheduledThisMonth = totalDaysScheduledThisMonth;
    report.totalDaysWorkedThisMonth = totalDaysWorkedThisMonth;

    for (const scheduleShift of shiftsOfSchedule) {
      let found = false;
      const scheduleDateString = new Date(
        scheduleShift.shiftStart
      ).toDateString();

      // schedule duration per shift
      const scheduleDuration =
        scheduleShift.shiftEnd &&
        scheduleShift.shiftStart &&
        Math.round(
          (scheduleShift.shiftEnd.getTime() -
            scheduleShift.shiftStart.getTime()) /
            60000
        );

      report.totalMinsScheduledThisMonth += scheduleDuration;

      // if today's scheduled time is found
      if (scheduleDateString === NOW.toDateString()) {
        report.totalMinsScheduledToday = scheduleDuration;
      }

      report.scheduleReport.forEach(
        (recordedShiftOfReport, recorded_shiftIdx) => {
          if (recordedShiftOfReport.date === scheduleDateString) {
            recordedShiftOfReport.scheduleStart = scheduleShift.shiftStart;
            recordedShiftOfReport.scheduleEnd = scheduleShift.shiftEnd;
            found = true;
          }
        }
      );

      // if corresponding shift is not found from recorded shifts
      if (!found) {
        report.scheduleReport.push({
          date: scheduleDateString,
          scheduleStart: scheduleShift.shiftStart,
          scheduleEnd: scheduleShift.shiftEnd
        });
      }
    }

    // calculate total absent mins of this month per user
    let totalAbsencePerUser = 0;
    for (const absence of await absences) {
      if (absence.startTime && absence.endTime) {
        totalAbsencePerUser +=
          (absence.endTime.getTime() - absence.startTime.getTime()) / 60000;
      }
    }
    report = {
      ...report,
      totalMinsAbsenceThisMonth: Math.trunc(totalAbsencePerUser),
      totalMinsWorkedThisMonth: totalMinsWorkedThisMonthPerUser
    };
  }

  //  calculate how many mins late per user
  let totalMinsLatePerUser = 0;

  report.scheduleReport.forEach((userSchedule, user_report_idx) => {
    if (
      userSchedule.recordedEnd &&
      userSchedule.recordedStart &&
      userSchedule.scheduleEnd &&
      userSchedule.scheduleStart
    ) {
      const shiftStartDiff =
        userSchedule.recordedStart.getTime() -
        userSchedule.scheduleStart.getTime();

      const shiftEndDiff =
        userSchedule.scheduleEnd.getTime() - userSchedule.recordedEnd.getTime();

      const sumMinsLate = Math.trunc(
        ((shiftEndDiff > 0 ? shiftEndDiff : 0) +
          (shiftStartDiff > 0 ? shiftStartDiff : 0)) /
          60000
      );

      // if report of today is found
      if (userSchedule.date === NOW.toDateString()) {
        report.totalMinsLateToday = sumMinsLate;
      }
      totalMinsLatePerUser += sumMinsLate;
      report.scheduleReport[user_report_idx].minsLate = sumMinsLate;
    }
  });

  report.totalMinsLateThisMonth = totalMinsLatePerUser;

  return report;
};

export const bichilTimeclockReportPreliminary = async (
  subdomain: string,
  userIds: string[],
  startDate: Date,
  endDate: Date,
  teamMembersObj?: any,
  exportToXlsx?: boolean
) => {
  const models = await generateModels(subdomain);

  const usersReport: IUsersReport = {};
  const shiftsOfSchedule: any = [];

  // get the schedule data of this month
  const schedules = await models.Schedules.find({
    userId: { $in: userIds }
  }).sort({
    userId: 1
  });

  const scheduleIds = schedules.map(schedule => schedule._id);

  const timeclocks = await models.Timeclocks.find({
    $and: [
      { userId: { $in: userIds } },
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      },
      {
        shiftEnd: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      }
    ]
  }).sort({ userId: 1 });

  shiftsOfSchedule.push(
    ...(await models.Shifts.find({
      $and: [
        { scheduleId: { $in: scheduleIds } },
        { status: 'Approved' },
        {
          shiftStart: {
            $gte: fixDate(startDate),
            $lte: customFixDate(endDate)
          }
        }
      ]
    }))
  );

  userIds.forEach(async currUserId => {
    // assign team member info from teamMembersObj

    if (exportToXlsx) {
      usersReport[currUserId] = { ...teamMembersObj[currUserId] };
    }

    const currUserTimeclocks = timeclocks.filter(
      timeclock => timeclock.userId === currUserId
    );

    const currUserSchedules = schedules.filter(
      schedule => schedule.userId === currUserId
    );

    // get shifts of schedule
    const currUserScheduleShifts: any = [];
    currUserSchedules.forEach(async userSchedule => {
      currUserScheduleShifts.push(
        ...shiftsOfSchedule.filter(
          scheduleShift => scheduleShift.scheduleId === userSchedule._id
        )
      );
    });

    let totalDaysWorkedPerUser = 0;
    let totalDaysScheduledPerUser = 0;

    if (currUserTimeclocks) {
      totalDaysWorkedPerUser = new Set(
        currUserTimeclocks.map(shift =>
          new Date(shift.shiftStart).toLocaleDateString()
        )
      ).size;
    }
    if (currUserScheduleShifts) {
      totalDaysScheduledPerUser += new Set(
        currUserScheduleShifts.map(shiftOfSchedule =>
          new Date(shiftOfSchedule.shiftStart).toLocaleDateString()
        )
      ).size;
    }

    if (exportToXlsx) {
      usersReport[currUserId].totalDaysScheduled = totalDaysScheduledPerUser;
      usersReport[currUserId].totalDaysWorked = totalDaysWorkedPerUser;
    } else {
      usersReport[currUserId] = {
        totalDaysScheduled: totalDaysScheduledPerUser,
        totalDaysWorked: totalDaysWorkedPerUser
      };
    }
  });

  return usersReport;
};

export const bichilTimeclockReportFinal = async (
  subdomain: string,
  userIds: string[],
  startDate: Date,
  endDate: Date,
  teamMembersObj?: any,
  exportToXlsx?: boolean
) => {
  let totalHoursScheduled = 0;
  let totalHoursWorked = 0;
  let totalShiftNotClosedDeduction = 0;
  let totalLateMinsDeduction = 0;
  let totalDeductionPerGroup = 0;
  let totalAbsentDeduction = 0;

  const models = await generateModels(subdomain);
  const usersReport: IUsersReport = {};
  const shiftsOfSchedule: any = [];

  const shiftNotClosedFee = 3000;
  const latenessFee = 200;
  const absentFee = 96000;

  // get the schedule data of this month
  const schedules = await models.Schedules.find({
    userId: { $in: userIds }
  }).sort({
    userId: 1
  });

  const scheduleIds = schedules.map(schedule => schedule._id);

  const timeclocks = await models.Timeclocks.find({
    $and: [
      { userId: { $in: userIds } },
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      }
    ]
  }).sort({ userId: 1 });

  shiftsOfSchedule.push(
    ...(await models.Shifts.find({
      $and: [
        { scheduleId: { $in: scheduleIds } },
        { status: 'Approved' },
        {
          shiftStart: {
            $gte: fixDate(startDate),
            $lte: customFixDate(endDate)
          }
        }
      ]
    }))
  );

  const shiftsOfScheduleConfigIds = shiftsOfSchedule.map(
    scheduleShift => scheduleShift.scheduleConfigId
  );
  const scheduleShiftsConfigs = await models.ScheduleConfigs.find({
    _id: { $in: shiftsOfScheduleConfigIds }
  });

  const schedulesObj = createSchedulesObj(userIds, schedules, shiftsOfSchedule);

  const requests = await models.Absences.find({
    userId: { $in: userIds },
    solved: true,
    startTime: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    },
    endTime: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    }
  });

  const relatedAbsenceTypes = await models.AbsenceTypes.find({
    _id: { $in: requests.map(request => request.absenceTypeId) }
  });

  const relatedAbsences = await returnTotalAbsences(requests, models);

  userIds.forEach(async currUserId => {
    let shiftNotClosedDaysPerUser = 0;

    // assign team member info from teamMembersObj
    if (exportToXlsx) {
      usersReport[currUserId] = { ...teamMembersObj[currUserId] };
    }

    const currUserTimeclocks = timeclocks.filter(
      timeclock => timeclock.userId === currUserId
    );

    const currUserRequests = requests.filter(
      request => request.userId === currUserId
    );

    const currUserSchedules = schedules.filter(
      schedule => schedule.userId === currUserId
    );

    // get shifts of schedule
    const currUserScheduleShifts: any = [];
    currUserSchedules.forEach(userSchedule => {
      currUserScheduleShifts.push(
        ...shiftsOfSchedule.filter(
          scheduleShift => scheduleShift.scheduleId === userSchedule._id
        )
      );
    });

    const scheduleShiftConfigsMap: { [scheduleConfigId: string]: number } = {};

    for (const scheduleConfig of scheduleShiftsConfigs) {
      scheduleShiftConfigsMap[scheduleConfig._id] =
        scheduleConfig.lunchBreakInMins;
    }

    // calculate total break time from schedules of an user
    const totalBreakOfSchedulesInHrs =
      currUserScheduleShifts.reduce(
        (partialBreakSum, userScheduleShift) =>
          partialBreakSum +
          (userScheduleShift.lunchBreakInMins ||
            scheduleShiftConfigsMap[userScheduleShift.scheduleConfigId] ||
            0),
        0
      ) / 60;

    let totalDaysWorkedPerUser = 0;
    let totalRegularHoursWorkedPerUser = 0;
    let totalHoursWorkedPerUser = 0;

    let totalDaysScheduledPerUser = 0;
    let totalHoursScheduledPerUser = 0;
    let totalDaysAbsentPerUser = 0;

    let totalHoursOvertimePerUser = 0;
    let totalMinsLatePerUser = 0;
    let totalHoursOvernightPerUser = 0;

    const totalScheduledDaysDict: {
      [dayString: string]: {
        shiftStart: Date;
        shiftEnd: Date;
        totalScheduledHours: number;
      };
    } = {};

    const totalTimeclocksDict: {
      [dayString: string]: {
        shiftStart: Date;
        shiftEnd?: Date;
      };
    } = {};

    const totalRequestsDict: {
      [dayString: string]: {
        request: true;
      };
    } = {};

    for (const request of currUserRequests) {
      // const requestDay = dayjs(userRequest.req)
      const { absenceTimeType, reason } = request;
      const lowerCasedReason = reason.toLowerCase();

      if (lowerCasedReason.includes('check')) {
        continue;
      }

      if (absenceTimeType === 'by day') {
        for (const requestDate of request.requestDates) {
          const date = dayjs(new Date(requestDate)).format(dateFormat);

          totalRequestsDict[date] = { request: true };
        }
      }

      // by hour
      const date = dayjs(request.startTime).format(dateFormat);

      totalRequestsDict[date] = { request: true };
    }

    for (const currUserTimeclock of currUserTimeclocks) {
      const { shiftStart, shiftEnd } = currUserTimeclock;
      const shiftDay = dayjs(shiftStart).format(dateFormat);

      totalTimeclocksDict[shiftDay] = { shiftStart, shiftEnd };
    }

    for (const userScheduleShift of currUserScheduleShifts) {
      const scheduledDay = dayjs(userScheduleShift.shiftStart).format(
        dateFormat
      );

      const getTotalScheduledHours =
        (new Date(userScheduleShift.shiftEnd).getTime() -
          new Date(userScheduleShift.shiftStart).getTime()) /
        MMSTOHRS;

      totalScheduledDaysDict[scheduledDay] = {
        shiftStart: userScheduleShift.shiftStart,
        shiftEnd: userScheduleShift.shiftEnd,
        totalScheduledHours: getTotalScheduledHours
      };

      // if user didnt work on scheduled day and didnt send any request, count as absent day
      if (
        !(
          scheduledDay in totalTimeclocksDict ||
          scheduledDay in totalRequestsDict
        ) &&
        new Date(scheduledDay).getTime() <= new Date().getTime()
      ) {
        totalDaysAbsentPerUser += 1;
      }
    }

    if (currUserTimeclocks) {
      totalDaysWorkedPerUser = new Set(
        currUserTimeclocks.map(shift =>
          new Date(shift.shiftStart).toLocaleDateString()
        )
      ).size;

      currUserTimeclocks.forEach(currUserTimeclock => {
        const shiftStart = currUserTimeclock.shiftStart;
        const shiftEnd = currUserTimeclock.shiftEnd;

        const nextDay = dayjs(shiftStart)
          .add(1, 'day')
          .format(dateFormat);

        const midnightOfShiftDay = new Date(nextDay + ' 00:00:00');

        if (
          currUserTimeclock.shiftNotClosed ||
          shiftEnd?.getTime() === midnightOfShiftDay.getTime()
        ) {
          shiftNotClosedDaysPerUser += 1;
          return;
        }

        if (shiftStart && shiftEnd) {
          // get time in hours
          const totalHoursWorkedPerShift =
            (shiftEnd.getTime() - shiftStart.getTime()) / MMSTOHRS;

          // make sure shift end is later than shift start
          if (totalHoursWorkedPerShift > 0) {
            totalRegularHoursWorkedPerUser += totalHoursWorkedPerShift;
          }

          totalHoursOvernightPerUser += returnOvernightHours(
            shiftStart,
            shiftEnd
          );

          if (
            currUserId in schedulesObj &&
            shiftStart.toLocaleDateString() in schedulesObj[currUserId]
          ) {
            const getScheduleOfTheDay =
              schedulesObj[currUserId][shiftStart.toLocaleDateString()];

            const scheduleShiftStart = getScheduleOfTheDay.shiftStart;
            const scheduleShiftEnd = getScheduleOfTheDay.shiftEnd;
            const lunchBreakInHrs = getScheduleOfTheDay.lunchBreakInMins / 60;

            const getScheduleDuration =
              Math.abs(
                scheduleShiftEnd.getTime() - scheduleShiftStart.getTime()
              ) /
                MMSTOHRS -
              lunchBreakInHrs;

            const getTimeClockDuration =
              Math.abs(shiftEnd.getTime() - shiftStart.getTime()) / MMSTOHRS;

            // get difference in schedule duration and time clock duration
            const getShiftDurationDiff =
              getTimeClockDuration - getScheduleDuration;

            // if timeclock > schedule --> deduct overtime
            if (getShiftDurationDiff > 0) {
              totalRegularHoursWorkedPerUser -= getShiftDurationDiff;
            } else {
              totalMinsLatePerUser +=
                Math.abs(getShiftDurationDiff) / MMSTOMINS;
            }
          }
        }
      });

      // deduct overtime from worked hours
      totalRegularHoursWorkedPerUser -= totalHoursOvertimePerUser;

      totalHoursWorkedPerUser =
        totalRegularHoursWorkedPerUser + totalHoursOvertimePerUser;
    }

    if (currUserScheduleShifts) {
      totalDaysScheduledPerUser += new Set(
        currUserScheduleShifts.map(shiftOfSchedule =>
          new Date(shiftOfSchedule.shiftStart).toLocaleDateString()
        )
      ).size;

      currUserScheduleShifts.forEach(scheduledDay => {
        const shiftStart = scheduledDay.shiftStart;
        const shiftEnd = scheduledDay.shiftEnd;
        // get time in hours
        const totalHoursScheduledPerShift =
          (shiftEnd.getTime() - shiftStart.getTime()) / MMSTOHRS;
        // make sure shift end is later than shift start
        if (totalHoursScheduledPerShift > 0) {
          totalHoursScheduledPerUser += totalHoursScheduledPerShift;
        }
      });
    }

    // calculate total days, total weekend days of the given interval
    const getDaysDifference =
      new Date(endDate).getTime() - new Date(startDate).getTime();

    let totalDaysBetweenInterval = Math.ceil(
      getDaysDifference / (1000 * 3600 * 24)
    );

    // add 1 day due end day is not inclusive
    totalDaysBetweenInterval++;

    // total hours scheduled
    // total hours worked
    // Ээлжийн амралт	Чөлөөтэй цаг	Өвчтэй
    // blank
    // blank
    // blank
    // shiftNotClosedDaysPerUser
    // shiftNotClosedFee 3000
    // shiftNotClosedDeduction
    // totalMinsLate
    // latenessFee 200
    // absentFee 96000
    // totalMinsLateDeduction
    // totalDeduction

    const userAbsenceInfo: IUserAbsenceInfo = returnUserAbsenceInfo(
      {
        requestsVacation: relatedAbsences.requestsVacation.filter(
          absence => absence.userId === currUserId
        ),
        requestsUnpaidAbsence: relatedAbsences.requestsUnpaidAbsence.filter(
          absence => absence.userId === currUserId
        ),
        requestsSick: relatedAbsences.requestsSick.filter(
          absence => absence.userId === currUserId
        )
      },
      relatedAbsenceTypes
    );

    const shiftNotClosedDeduction =
      shiftNotClosedDaysPerUser * shiftNotClosedFee;
    const totalMinsLateDeduction = totalMinsLatePerUser * latenessFee;
    const absentDeductionPerUser = totalDaysAbsentPerUser * absentFee;

    const totalDeduction =
      shiftNotClosedDeduction + totalMinsLateDeduction + absentDeductionPerUser;

    if (totalHoursScheduledPerUser > 0) {
      totalHoursScheduledPerUser -= totalBreakOfSchedulesInHrs;
    }

    totalHoursScheduled += totalHoursScheduledPerUser;
    totalHoursWorked += totalHoursWorkedPerUser;
    totalShiftNotClosedDeduction += shiftNotClosedDeduction;
    totalLateMinsDeduction += totalMinsLateDeduction;
    totalAbsentDeduction += absentDeductionPerUser;
    totalDeductionPerGroup += totalDeduction;

    usersReport[currUserId] = {
      ...usersReport[currUserId],

      totalHoursScheduled: totalHoursScheduledPerUser.toFixed(2),
      totalHoursWorked: totalHoursWorkedPerUser.toFixed(2),

      ...userAbsenceInfo,

      leftWork: '-',
      paidBonus: '-',
      paidBonus2: '-',

      shiftNotClosedDaysPerUser,
      shiftNotClosedFee,
      shiftNotClosedDeduction,

      totalMinsLate: totalMinsLatePerUser,
      latenessFee,
      totalMinsLateDeduction,

      totalDaysAbsent: totalDaysAbsentPerUser,
      absentFee,
      absentDeduction: absentDeductionPerUser,

      totalDeduction
    };
  });

  return {
    report: usersReport,
    deductionInfo: {
      totalHoursScheduled,
      totalHoursWorked,
      totalShiftNotClosedDeduction,
      totalLateMinsDeduction,
      totalAbsentDeduction,
      totalDeductionPerGroup
    }
  };
};

export const bichilTimeclockReportPivot = async (
  subdomain: string,
  userIds: string[],
  startDate?: Date,
  endDate?: Date,
  teamMembersObj?: any,
  exportToXlsx?: boolean
) => {
  const models = await generateModels(subdomain);
  const usersReport: any = { scheduleReport: [] };
  const shiftsOfSchedule: any = [];

  // get the schedule data of this month
  const schedules = await models.Schedules.find({
    userId: { $in: userIds }
  }).sort({
    userId: 1
  });

  const scheduleIds = schedules.map(schedule => schedule._id);

  const timeclocks = await models.Timeclocks.find({
    $and: [
      { userId: { $in: userIds } },
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      },
      {
        shiftEnd: {
          $gte: fixDate(startDate),
          $lte: customFixDate(endDate)
        }
      }
    ]
  }).sort({ userId: 1 });

  shiftsOfSchedule.push(
    ...(await models.Shifts.find({
      $and: [
        { scheduleId: { $in: scheduleIds } },
        { status: 'Approved' },
        {
          shiftStart: {
            $gte: fixDate(startDate),
            $lte: customFixDate(endDate)
          }
        }
      ]
    }))
  );

  const schedulesObj = createSchedulesObj(userIds, schedules, shiftsOfSchedule);

  userIds.forEach(async currUserId => {
    // assign team member info from teamMembersObj

    if (exportToXlsx) {
      usersReport[currUserId] = { ...teamMembersObj[currUserId] };
    }

    const currUserTimeclocks = timeclocks.filter(
      timeclock => timeclock.userId === currUserId
    );

    const currUserSchedules = schedules.filter(
      schedule => schedule.userId === currUserId
    );

    // get shifts of schedule
    const currUserScheduleShifts: any = [];
    currUserSchedules.forEach(userSchedule => {
      currUserScheduleShifts.push(
        ...shiftsOfSchedule.filter(
          scheduleShift => scheduleShift.scheduleId === userSchedule._id
        )
      );
    });

    const totalShiftsOfUser: any = [];

    if (currUserTimeclocks) {
      currUserTimeclocks.forEach(currUserTimeclock => {
        let totalHoursOvertimePerShift = 0;
        let totalMinsLatePerShift = 0;
        let totalHoursOvernightPerShift = 0;

        const shiftStart = currUserTimeclock.shiftStart;
        const shiftEnd = currUserTimeclock.shiftEnd;
        if (shiftStart && shiftEnd) {
          totalHoursOvernightPerShift = returnOvernightHours(
            shiftStart,
            shiftEnd
          );

          const scheduledDay = shiftStart.toLocaleDateString();
          const getTimeClockDuration = Math.abs(
            shiftEnd.getTime() - shiftStart.getTime()
          );

          let scheduleShiftStart;
          let scheduleShiftEnd;
          let getScheduleDuration: number = 0;
          if (
            currUserId in schedulesObj &&
            scheduledDay in schedulesObj[currUserId]
          ) {
            const getScheduleOfTheDay = schedulesObj[currUserId][scheduledDay];

            scheduleShiftStart = getScheduleOfTheDay.shiftStart;
            scheduleShiftEnd = getScheduleOfTheDay.shiftEnd;

            getScheduleDuration = Math.abs(
              scheduleShiftEnd.getTime() - scheduleShiftStart.getTime()
            );

            // get difference in schedule duration and time clock duration
            const getShiftDurationDiff =
              getTimeClockDuration - getScheduleDuration;

            // get difference in shift start and scheduled start
            const getShiftStartDiff =
              shiftStart.getTime() - scheduleShiftStart.getTime();

            // if shift start is later than scheduled start --> late
            if (getShiftStartDiff > 0) {
              totalMinsLatePerShift = getShiftStartDiff / MMSTOMINS;
            }
            // if timeclock > schedule --> overtime
            if (getShiftDurationDiff > 0) {
              totalHoursOvertimePerShift = getShiftDurationDiff / MMSTOHRS;
            }
          }

          totalShiftsOfUser.push({
            timeclockDate: scheduledDay,
            timeclockStart: shiftStart,
            timeclockEnd: shiftEnd,
            timeclockDuration: (getTimeClockDuration / MMSTOHRS).toFixed(2),
            deviceType: currUserTimeclock.deviceType,
            deviceName: currUserTimeclock.deviceName,
            scheduledStart: scheduleShiftStart,
            scheduledEnd: scheduleShiftEnd,
            scheduledDuration: (getScheduleDuration / MMSTOHRS).toFixed(2),
            totalMinsLate: totalMinsLatePerShift.toFixed(2),
            totalHoursOvertime: totalHoursOvertimePerShift.toFixed(2),
            totalHoursOvernight: totalHoursOvernightPerShift.toFixed(2)
          });
        }
      });
    }

    usersReport[currUserId] = {
      ...usersReport[currUserId],
      scheduleReport: totalShiftsOfUser.sort(
        (a, b) =>
          new Date(a.timeclockStart).getTime() -
          new Date(b.timeclockStart).getTime()
      )
    };
  });

  return usersReport;
};

const returnOvernightHours = (shiftStart: Date, shiftEnd: Date) => {
  // check whether shift is between 22:00 - 06:00, if so return how many hours is overnight
  const shiftDay = shiftStart.toLocaleDateString();
  const nextDay = dayjs(shiftDay)
    .add(1, 'day')
    .toDate()
    .toLocaleDateString();

  const overnightStart = dayjs(shiftDay + ' ' + '22:00:00').toDate();
  const overnightEnd = dayjs(nextDay + ' ' + '06:00:00').toDate();

  let totalOvernightHours = 0;

  // 19:42 08:16
  // if shift end is less than 22:00 then no overnight time
  if (shiftEnd > overnightStart) {
    const getOvernightDuration =
      (shiftEnd > overnightEnd ? overnightEnd.getTime() : shiftEnd.getTime()) -
      (shiftStart < overnightStart
        ? overnightStart.getTime()
        : shiftStart.getTime());

    totalOvernightHours += getOvernightDuration / MMSTOHRS;
  }

  return totalOvernightHours;
};

const createSchedulesObj = (
  userIds: string[],
  totalSchedules: IScheduleDocument[],
  totalScheduleShifts: IShiftDocument[]
) => {
  const returnObject = {};

  for (const userId of userIds) {
    const currEmpSchedules = totalSchedules.filter(
      schedule => schedule.userId === userId
    );

    if (currEmpSchedules.length) {
      returnObject[userId] = {};
    }
    for (const empSchedule of currEmpSchedules) {
      const currEmpScheduleShifts = totalScheduleShifts.filter(
        scheduleShift => scheduleShift.scheduleId === empSchedule._id
      );

      currEmpScheduleShifts.forEach(currEmpScheduleShift => {
        const date_key = currEmpScheduleShift.shiftStart?.toLocaleDateString();
        returnObject[userId][date_key] = {
          shiftStart: currEmpScheduleShift.shiftStart,
          shiftEnd: currEmpScheduleShift.shiftEnd,
          lunchBreakInMins: currEmpScheduleShift.lunchBreakInMins || 0
        };
      });
    }
  }

  return returnObject;
};

const returnTotalAbsences = async (
  totalRequests: IAbsence[],
  models?: IModels
): Promise<{
  requestsVacation: IAbsence[];
  requestsUnpaidAbsence: IAbsence[];
  requestsSick: IAbsence[];
}> => {
  const requestsVacation = totalRequests.filter(request =>
    request.reason.toLocaleLowerCase().includes('ээлжийн амралт')
  );

  const requestsUnpaidAbsence = totalRequests.filter(request =>
    request.reason.toLocaleLowerCase().includes('чөлөөтэй')
  );

  const requestsSick = totalRequests.filter(request =>
    request.reason.toLowerCase().includes('өвчтэй')
  );

  return {
    requestsVacation,
    requestsUnpaidAbsence,
    requestsSick
  };
};

const returnUserAbsenceInfo = (
  relatedAbsences: any,
  relatedAbsenceTypes: IAbsenceTypeDocument[]
): IUserAbsenceInfo => {
  let totalHoursVacation = 0;
  let totalHoursUnpaidAbsence = 0;
  let totalHoursSick = 0;

  relatedAbsences.requestsVacation.forEach(request => {
    if (request.totalHoursOfAbsence) {
      totalHoursVacation += parseFloat(request.totalHoursOfAbsence);
      return;
    }

    const absenceType = relatedAbsenceTypes.find(
      absType => absType._id === request.absenceTypeId
    );

    if (absenceType && absenceType.requestTimeType === 'by day') {
      const getTotalDays = request.requestDates
        ? request.requestDates.length
        : Math.ceil(
            (request.endTime.getTime() - request.startTime.getTime()) /
              MMSTODAYS
          );

      totalHoursVacation +=
        getTotalDays * (absenceType.requestHoursPerDay || 0);
      return;
    }

    totalHoursVacation +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  relatedAbsences.requestsUnpaidAbsence.forEach(request => {
    if (request.totalHoursOfAbsence) {
      totalHoursUnpaidAbsence += parseFloat(request.totalHoursOfAbsence);
      return;
    }

    const absenceType = relatedAbsenceTypes.find(
      absType => absType._id === request.absenceTypeId
    );

    if (absenceType && absenceType.requestTimeType === 'by day') {
      const getTotalDays = request.requestDates
        ? request.requestDates.length
        : Math.ceil(
            (request.endTime.getTime() - request.startTime.getTime()) /
              MMSTODAYS
          );

      totalHoursUnpaidAbsence +=
        getTotalDays * (absenceType.requestHoursPerDay || 0);
      return;
    }

    totalHoursUnpaidAbsence +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  relatedAbsences.requestsSick.forEach(request => {
    if (request.totalHoursOfAbsence) {
      totalHoursSick += parseFloat(request.totalHoursOfAbsence);
      return;
    }

    const absenceType = relatedAbsenceTypes.find(
      absType => absType._id === request.absenceTypeId
    );

    if (absenceType && absenceType.requestTimeType === 'by day') {
      const getTotalDays = request.requestDates
        ? request.requestDates.length
        : Math.ceil(
            (request.endTime.getTime() - request.startTime.getTime()) /
              MMSTODAYS
          );

      totalHoursSick += getTotalDays * (absenceType.requestHoursPerDay || 0);
      return;
    }

    totalHoursSick +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  return {
    totalHoursVacation,
    totalHoursUnpaidAbsence,
    totalHoursSick
  };
};

export const bichilTimeclockReportPerUser = async (
  models: IModels,
  userId: string,
  selectedMonth: string,
  selectedYear: string,
  selectedDate?: string
) => {
  let report: any = {
    scheduleReport: [],
    userId,
    totalHoursScheduledSelectedMonth: 0
  };

  // get 1st of the next Month
  const NOW = new Date();

  const selectedMonthIndex = new Date(
    Date.parse(selectedMonth + ' 1, 2000')
  ).getMonth();

  const nextMonthIndex = selectedMonthIndex === 11 ? 0 : selectedMonthIndex + 1;

  // get 1st of month
  const startOfSelectedMonth = new Date(
    parseFloat(selectedYear),
    selectedMonthIndex
  );
  // start of the next month
  const startOfNextMonth = new Date(
    parseFloat(selectedYear),
    nextMonthIndex,
    1
  );

  const endOfSelectedMonth = new Date(startOfNextMonth.getTime() - 1);

  // start, end Time filter for queries
  let startOfSelectedDay;

  if (selectedDate) {
    startOfSelectedDay = new Date(selectedDate);
  }

  const selectedDayString = startOfSelectedDay
    ? startOfSelectedDay.toLocaleDateString()
    : '';

  const scheduleShiftsSelectedMonth: IShiftDocument[] = [];

  // get the schedule data of selected month
  const totalSchedulesOfUser = await models.Schedules.find({
    userId,
    solved: true,
    status: 'Approved'
  });

  const totalScheduleIds = totalSchedulesOfUser.map(schedule => schedule._id);

  //  schedule shifts of selected month
  scheduleShiftsSelectedMonth.push(
    ...(await models.Shifts.find({
      scheduleId: { $in: totalScheduleIds },
      status: 'Approved',
      shiftStart: {
        $gte: startOfSelectedMonth,
        $lte: endOfSelectedMonth
      }
    }))
  );

  const scheduleShiftConfigsSelectedMonth = await models.ScheduleConfigs.find({
    _id: {
      $in: scheduleShiftsSelectedMonth.map(shift => shift.scheduleConfigId)
    }
  });

  const scheduleShiftConfisMap: {
    [configId: string]: IScheduleConfigDocument;
  } = {};

  for (const config of scheduleShiftConfigsSelectedMonth) {
    scheduleShiftConfisMap[config._id] = config;
  }

  const timeclocksOfSelectedMonth = await models.Timeclocks.find({
    $and: [
      { userId },
      {
        shiftStart: {
          $gte: startOfSelectedMonth,
          $lte: endOfSelectedMonth
        }
      }
    ]
  });

  const totalRequestsOfUser = await models.Absences.find({
    userId,
    solved: true,
    checkInOutRequest: { $exists: false },
    status: { $regex: /Approved/, $options: 'gi' }
  });

  const requestsOfSelectedMonth = totalRequestsOfUser.filter(
    req =>
      dayjs(req.startTime) >= dayjs(startOfSelectedMonth) &&
      dayjs(req.startTime) < dayjs(endOfSelectedMonth)
  );

  const absenceTypeIds = requestsOfSelectedMonth.map(req => req.absenceTypeId);
  let totalHoursRequestsSelectedMonth = 0;
  let totalDaysAbsentSelectedMonth = 0;

  const absenceTypes = await models.AbsenceTypes.find({
    _id: { $in: absenceTypeIds }
  });

  const totalTimeclocksDict: {
    [dayString: string]: {
      shiftStart: Date;
      shiftEnd?: Date;
      shiftNotClosed?: boolean;
    };
  } = {};

  const totalRequestsDict: {
    [dayString: string]: {
      request: true;
    };
  } = {};

  for (const request of requestsOfSelectedMonth) {
    const { absenceTimeType } = request;

    //  by day
    if (absenceTimeType === 'by day') {
      for (const requestDate of request.requestDates) {
        const date = dayjs(new Date(requestDate)).format(dateFormat);

        totalRequestsDict[date] = { request: true };
      }
    }

    // by hour
    const date = dayjs(request.startTime).format(dateFormat);
    totalRequestsDict[date] = { request: true };

    if (request.totalHoursOfAbsence) {
      totalHoursRequestsSelectedMonth += parseFloat(
        request.totalHoursOfAbsence
      );
      continue;
    }
    // absence by hour
    if (request.absenceTimeType === 'by hour' && request.endTime) {
      const getTotalHoursOfAbsence =
        (new Date(request.endTime).getTime() -
          new Date(request.startTime).getTime()) /
        MMSTOHRS;

      totalHoursRequestsSelectedMonth += getTotalHoursOfAbsence;
      continue;
    }
    // absence by day
    if (request.absenceTimeType === 'by day' && request.requestDates) {
      const getAbsenceType = absenceTypes.find(
        absType => absType._id === request.absenceTypeId
      );

      const getTotalHoursOfAbsence =
        request.requestDates.length * (getAbsenceType?.requestHoursPerDay || 0);

      totalHoursRequestsSelectedMonth += getTotalHoursOfAbsence;
    }
  }

  let scheduledShiftStartSelectedDay;
  let scheduledShiftEndSelectedDay;

  let recordedShiftStartSelectedDay;
  let recordedShiftEndSelectedDay;

  let totalHoursWorkedSelectedMonth = 0;
  let totalHoursWorkedSelectedDay = 0;

  let totalHoursScheduledSelectedMonth = 0;
  let totalMinsLateSelectedMonth = 0;
  let totalMinsLateSelectedDay = 0;

  // all below calculated according to selected
  let totalHoursNotWorked = 0;
  const notWorkedDays: string[] = [];
  let totalDaysNotWorked = 0;
  let totalHoursWorkedOutsideSchedule = 0;
  let totalDaysWorkedOutsideSchedule = 0;

  let totalHoursBreakTaken = 0;
  let totalHoursBreakScheduled = 0;
  let totalHoursBreakSelectedDay = 0;

  // if any of the schemas is not empty
  if (
    scheduleShiftsSelectedMonth.length !== 0 ||
    timeclocksOfSelectedMonth.length !== 0 ||
    requestsOfSelectedMonth.length !== 0
  ) {
    //  timeclocks
    for (const timeclock of timeclocksOfSelectedMonth) {
      const previousSchedules = report.scheduleReport;

      // used for counting absent days
      const shiftDay = dayjs(timeclock.shiftStart).format(dateFormat);
      totalTimeclocksDict[shiftDay] = {
        shiftStart: timeclock.shiftStart,
        shiftEnd: timeclock.shiftEnd,
        shiftNotClosed: timeclock.shiftNotClosed
      };

      if (timeclock.shiftNotClosed) {
        continue;
      }

      const shiftDuration =
        (timeclock.shiftEnd &&
          timeclock.shiftStart &&
          (timeclock.shiftEnd.getTime() - timeclock.shiftStart.getTime()) /
            MMSTOHRS) ||
        0;

      totalHoursWorkedSelectedMonth += shiftDuration;

      if (timeclock.shiftStart.toLocaleDateString() === selectedDayString) {
        totalHoursWorkedSelectedDay += shiftDuration;
        report.totalHoursWorkedSelectedDay = totalHoursWorkedSelectedDay;
      }

      report = {
        ...report,
        scheduleReport: previousSchedules?.concat({
          date: new Date(timeclock.shiftStart).toLocaleDateString(),
          checked: false,
          recordedStart: timeclock.shiftStart,
          recordedEnd: timeclock.shiftEnd,
          shiftDuration
        })
      };
    }

    const totalDaysWorkedSelectedMonth = new Set(
      timeclocksOfSelectedMonth.map(shift => {
        return new Date(shift.shiftStart).toLocaleDateString();
      })
    ).size;

    const totalDaysScheduledSelectedMonth = new Set(
      scheduleShiftsSelectedMonth.map(scheduleShift =>
        new Date(scheduleShift.shiftStart || '').toLocaleDateString()
      )
    ).size;

    //  schedules
    for (const scheduleShift of scheduleShiftsSelectedMonth) {
      let lunchBreakOfDay = 0;

      const scheduleDateString = new Date(
        scheduleShift.shiftStart || ''
      ).toLocaleDateString();

      const scheduledDay = dayjs(scheduleShift.shiftStart).format(dateFormat);

      // if user didnt work on scheduled day and didnt send any request, count as absent day
      if (
        !(
          scheduledDay in totalTimeclocksDict ||
          scheduledDay in totalRequestsDict
        ) &&
        new Date(scheduledDay).getTime() <= new Date().getTime()
      ) {
        totalDaysAbsentSelectedMonth += 1;
      }

      // schedule duration per shift
      let scheduleDuration =
        scheduleShift.shiftEnd &&
        scheduleShift.shiftStart &&
        scheduleShift.shiftEnd >= scheduleShift.shiftStart
          ? (scheduleShift.shiftEnd.getTime() -
              scheduleShift.shiftStart.getTime()) /
            MMSTOHRS
          : 0;

      // deduct lunch break
      const findScheduleConfig =
        scheduleShiftConfisMap[scheduleShift.scheduleConfigId || ''];

      if (findScheduleConfig) {
        lunchBreakOfDay = findScheduleConfig.lunchBreakInMins / 60;
      }

      scheduleDuration -= lunchBreakOfDay;
      totalHoursBreakScheduled += lunchBreakOfDay;

      // if user worked more than scheduled duration, discard overtime
      if (
        scheduledDay in totalTimeclocksDict &&
        !totalTimeclocksDict[scheduledDay].shiftNotClosed
      ) {
        const timeclockOfDay = totalTimeclocksDict[scheduledDay];
        const timeclockDuration =
          (timeclockOfDay.shiftStart &&
            timeclockOfDay.shiftEnd &&
            (new Date(timeclockOfDay.shiftEnd).getTime() -
              new Date(timeclockOfDay.shiftStart).getTime()) /
              MMSTOHRS) ||
          0;

        const overtimeHours = timeclockDuration - scheduleDuration;

        if (overtimeHours >= 0) {
          totalHoursWorkedSelectedMonth -= overtimeHours;
        } else {
          totalMinsLateSelectedMonth += Math.abs(overtimeHours) / 60;
        }
      }

      totalHoursScheduledSelectedMonth += scheduleDuration;

      // if selected day's scheduled time is found
      if (scheduleDateString === selectedDayString) {
        report.totalHoursScheduledSelectedDay = scheduleDuration;

        const recordedShiftOfSelectedDay = report.scheduleReport.find(
          shift =>
            shift.date === selectedDayString &&
            shift.recordedStart &&
            !shift.checked
        );

        scheduledShiftStartSelectedDay = scheduleShift.shiftStart;
        scheduledShiftEndSelectedDay = scheduleShift.shiftEnd;

        if (
          recordedShiftOfSelectedDay &&
          recordedShiftOfSelectedDay.recordedStart &&
          scheduleShift.shiftStart
        ) {
          // if corresponding timeclock of a selected day found, calculate how many mins late
          const shiftStartDiff =
            recordedShiftOfSelectedDay.recordedStart.getTime() -
            scheduleShift.shiftStart.getTime();

          recordedShiftStartSelectedDay =
            recordedShiftOfSelectedDay.recordedStart;
          recordedShiftEndSelectedDay = recordedShiftOfSelectedDay.recordedEnd;

          if (shiftStartDiff > 0) {
            totalMinsLateSelectedDay += shiftStartDiff / MMSTOMINS;
          }

          totalHoursBreakSelectedDay = lunchBreakOfDay;
          report.totalHoursWorkedSelectedDay = report.totalHoursWorkedSelectedDay
            ? report.totalHoursWorkedSelectedDay - lunchBreakOfDay
            : 0;
        }
      }

      // const recordedShiftIdx = report.scheduleReport.findIndex(
      //   shift => shift.date === scheduleDateString && !shift.checked
      // );

      // // no timeclock found, thus not worked on a scheduled day
      // if (recordedShiftIdx === -1) {
      //   notWorkedDays.push(scheduleDateString);
      //   totalHoursNotWorked += scheduleDuration;
      // } else {
      //   // corresponding timeclock found, calculate how many mins late
      //   if (scheduleShift.shiftStart) {
      //     const shiftStartDiff =
      //       report.scheduleReport[recordedShiftIdx].recordedStart.getTime() -
      //       scheduleShift.shiftStart.getTime();

      //     if (shiftStartDiff > 0) {
      //       totalMinsLateSelectedMonth += shiftStartDiff / MMSTOMINS;
      //     }
      //   }

      //   report.scheduleReport[recordedShiftIdx].checked = true;

      //   totalHoursBreakTaken += lunchBreakOfDay;
      // }

      // report.totalHoursScheduledSelectedMonth += scheduleDuration;
    }

    // calcute shifts worked outside schedule
    const shiftsWorkedOutsideSchedule = report.scheduleReport.filter(
      shift => !shift.checked
    );

    totalDaysWorkedOutsideSchedule = shiftsWorkedOutsideSchedule.length;

    totalHoursWorkedOutsideSchedule = shiftsWorkedOutsideSchedule.reduce(
      (partialHoursSum, shift) => partialHoursSum + shift.shiftDuration || 0,
      0
    );

    totalDaysNotWorked = new Set(notWorkedDays).size;

    const scheduleReport = [
      {
        timeclockDate: selectedDayString,
        timeclockStart: recordedShiftStartSelectedDay,
        timeclockEnd: recordedShiftEndSelectedDay,

        scheduledStart: scheduledShiftStartSelectedDay,
        scheduledEnd: scheduledShiftEndSelectedDay
      }
    ];

    report = {
      ...report,
      totalDaysNotWorked,
      totalHoursNotWorked,

      totalDaysWorkedOutsideSchedule,
      totalHoursWorkedOutsideSchedule,

      totalHoursBreakTaken,
      totalHoursBreakScheduled,
      totalHoursBreakSelectedDay,

      totalHoursWorkedSelectedDay,
      totalMinsLateSelectedDay,

      totalMinsLateSelectedMonth,
      totalDaysWorkedSelectedMonth,
      totalHoursWorkedSelectedMonth,
      totalHoursRequestsSelectedMonth,
      totalDaysAbsentSelectedMonth,

      totalDaysScheduledSelectedMonth,
      totalHoursScheduledSelectedMonth,

      // requests: requestsOfSelectedMonth,
      // scheduledShifts: scheduleShiftsSelectedMonth,
      // timeclocks: timeclocksOfSelectedMonth,

      scheduleReport
    };
  }

  return report;
};
