import { fixDate } from '@erxes/api-utils/src';
import dayjs = require('dayjs');
import { generateModels, IModels } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import {
  IAbsence,
  IAbsenceTypeDocument,
  IScheduleDocument,
  IShiftDocument,
  IUserAbsenceInfo,
  IUserReport,
  IUsersReport
} from '../../models/definitions/timeclock';
import { customFixDate } from '../../utils';

// milliseconds to mins
const MMSTOMINS = 60000;
// milliseconds to hrs
const MMSTOHRS = MMSTOMINS * 60;
// millieseconds to days
const MMSTODAYS = MMSTOHRS * 24;

export const paginateArray = (array, perPage = 20, page = 1) =>
  array.slice((page - 1) * perPage, page * perPage);

export const findBranches = async (subdomain: string, branchIds: string[]) => {
  const branches = await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { _id: { $in: branchIds } } },
    isRPC: true
  });

  return branches;
};

export const findUser = async (subdomain: string, userId: string) => {
  const user = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: userId
    },
    isRPC: true
  });

  return user;
};

export const findBranchUsers = async (
  subdomain: string,
  branchIds: string[]
) => {
  const branchUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { branchIds: { $in: branchIds } } },
    isRPC: true
  });
  return branchUsers;
};

export const findDepartmentUsers = async (
  subdomain: string,
  departmentIds: string[]
) => {
  const deptUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { departmentIds: { $in: departmentIds } } },
    isRPC: true
  });
  return deptUsers;
};

export const returnUnionOfUserIds = async (
  branchIds: string[],
  departmentIds: string[],
  userIds: string[],
  subdomain: any
) => {
  if (userIds.length) {
    return userIds;
  }
  const concatBranchDept: string[] = [];

  if (branchIds) {
    const branchUsers = await findBranchUsers(subdomain, branchIds);
    const branchUserIds = branchUsers.map(branchUser => branchUser._id);
    concatBranchDept.push(...branchUserIds);
  }
  if (departmentIds) {
    const departmentUsers = await findDepartmentUsers(subdomain, departmentIds);
    const departmentUserIds = departmentUsers.map(
      departmentUser => departmentUser._id
    );
    concatBranchDept.push(...departmentUserIds);
  }

  // prevent creating double schedule for common users
  const sorted = concatBranchDept.sort();
  const unionOfUserIds = sorted.filter((value, pos) => {
    return concatBranchDept.indexOf(value) === pos;
  });

  return unionOfUserIds;
};
export const createScheduleShiftsByUserIds = async (
  userIds: string[],
  scheduleShifts,
  models: IModels,
  totalBreakInMins?: number
) => {
  const shiftsBulkCreateOps: any[] = [];

  let schedule;
  for (const userId of userIds) {
    schedule = await models.Schedules.createSchedule({
      userId,
      solved: true,
      status: 'Approved',
      submittedByAdmin: true,
      totalBreakInMins
    });

    for (const shift of scheduleShifts) {
      shiftsBulkCreateOps.push({
        insertOne: {
          document: {
            scheduleId: schedule._id,
            shiftStart: shift.shiftStart,
            shiftEnd: shift.shiftEnd,
            scheduleConfigId: shift.scheduleConfigId,
            solved: true,
            status: 'Approved'
          }
        }
      });
    }
  }

  // create shifts of each schedule
  await models.Shifts.bulkWrite(shiftsBulkCreateOps);

  return schedule;
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
    userId: `${userId}`,
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
    userId,
    status: 'Approved',
    startTime: {
      $gte: fixDate(startTime),
      $lte: fixDate(endTime)
    }
  });

  for (const { _id } of await schedules) {
    shiftsOfSchedule.push(
      ...(await models.Shifts.find({
        scheduleId: _id,
        status: 'Approved',
        shiftStart: {
          $gte: fixDate(startTime),
          $lte: fixDate(endTime)
        }
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

export const timeclockReportPreliminary = async (
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

export const timeclockReportFinal = async (
  subdomain: string,
  userIds: string[],
  startDate?: Date,
  endDate?: Date,
  teamMembersObj?: any,
  exportToXlsx?: boolean
) => {
  const models = await generateModels(subdomain);
  const usersReport: IUsersReport = {};
  const shiftsOfSchedule: any = [];

  // get the schedule data of time interval
  const schedules = await models.Schedules.find({
    userId: { $in: userIds },
    solved: true,
    status: { $regex: /Approved/gi }
  }).sort({
    userId: 1
  });

  const scheduleIds = schedules.map(schedule => schedule._id);

  // get all approved absence requests
  const requests = await models.Absences.find({
    solved: true,
    status: /approved/gi
  });

  const relatedAbsenceTypes = await models.AbsenceTypes.find({
    _id: { $in: requests.map(request => request.absenceTypeId) }
  });

  // get all related absences
  const relatedAbsences = await returnTotalAbsences(requests, models);

  // find total Timeclocks
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

    let totalDaysWorkedPerUser = 0;
    let totalRegularHoursWorkedPerUser = 0;
    let totalHoursWorkedPerUser = 0;

    let totalDaysScheduledPerUser = 0;
    let totalHoursScheduledPerUser = 0;

    let totalHoursOvertimePerUser = 0;
    let totalMinsLatePerUser = 0;
    let totalHoursOvernightPerUser = 0;

    // calculate total break time from schedules of an user
    const totalBreakInHours =
      currUserSchedules.reduce(
        (partialBreakSum, userSchedule) =>
          userSchedule.totalBreakInMins || 0 + partialBreakSum,
        0
      ) / 60;

    if (currUserTimeclocks) {
      totalDaysWorkedPerUser = new Set(
        currUserTimeclocks.map(shift =>
          new Date(shift.shiftStart).toLocaleDateString()
        )
      ).size;

      currUserTimeclocks.forEach(currUserTimeclock => {
        const shiftStart = currUserTimeclock.shiftStart;
        const shiftEnd = currUserTimeclock.shiftEnd;
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

            const getScheduleDuration = Math.abs(
              scheduleShiftEnd.getTime() - scheduleShiftStart.getTime()
            );

            const getTimeClockDuration = Math.abs(
              shiftEnd.getTime() - shiftStart.getTime()
            );

            // get difference in schedule duration and time clock duration
            const getShiftDurationDiff =
              getTimeClockDuration - getScheduleDuration;

            // get difference in shift start and scheduled start
            const getShiftStartDiff =
              shiftStart.getTime() - scheduleShiftStart.getTime();

            // if shift start is later than scheduled start --> late
            if (getShiftStartDiff > 0) {
              totalMinsLatePerUser += getShiftStartDiff / MMSTOMINS;
            }
            // if timeclock > schedule --> overtime
            if (getShiftDurationDiff > 0) {
              totalHoursOvertimePerUser += getShiftDurationDiff / MMSTOHRS;
            }
          }
        }
      });

      // deduct lunch break from worked hours
      if (totalRegularHoursWorkedPerUser) {
        totalRegularHoursWorkedPerUser -= totalBreakInHours;
      }

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

    const userAbsenceInfo: IUserAbsenceInfo = await returnUserAbsenceInfo(
      {
        requestsWorkedAbroad: relatedAbsences.requestsWorkedAbroad.filter(
          absence => absence.userId === currUserId
        ),
        requestsPaidAbsence: relatedAbsences.requestsPaidAbsence.filter(
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

    // deduct lunch breaks from total scheduled hours
    if (totalHoursScheduledPerUser) {
      totalHoursScheduledPerUser -= totalBreakInHours;
    }

    if (exportToXlsx) {
      usersReport[currUserId] = {
        ...usersReport[currUserId],
        totalDaysScheduled: totalDaysScheduledPerUser,
        totalHoursScheduled: totalHoursScheduledPerUser.toFixed(2),
        totalHoursBreak: totalBreakInHours.toFixed(2),
        totalDaysWorked: totalDaysWorkedPerUser,
        totalRegularHoursWorked: totalRegularHoursWorkedPerUser.toFixed(2),
        totalHoursOvertime: totalHoursOvertimePerUser.toFixed(2),
        totalHoursOvernight: totalHoursOvernightPerUser.toFixed(2),
        totalHoursWorked: totalHoursWorkedPerUser.toFixed(2),
        totalMinsLate: totalMinsLatePerUser.toFixed(2),
        ...userAbsenceInfo
      };
      return;
    }

    usersReport[currUserId] = {
      ...usersReport[currUserId],
      totalDaysScheduled: totalDaysScheduledPerUser,
      totalHoursScheduled: totalHoursScheduledPerUser.toFixed(2),
      totalHoursBreak: totalBreakInHours.toFixed(2),
      totalDaysWorked: totalDaysWorkedPerUser,
      totalRegularHoursWorked: totalRegularHoursWorkedPerUser.toFixed(2),
      totalHoursOvertime: totalHoursOvertimePerUser.toFixed(2),
      totalHoursOvernight: totalHoursOvernightPerUser.toFixed(2),
      totalHoursWorked: totalHoursWorkedPerUser.toFixed(2),
      totalMinsLate: totalMinsLatePerUser.toFixed(2),
      absenceInfo: userAbsenceInfo
    };
  });

  return usersReport;
};

export const timeclockReportPivot = async (
  subdomain: string,
  userIds: string[],
  startDate?: Date,
  endDate?: Date,
  teamMembersObj?: any,
  exportToXlsx?: boolean
) => {
  const models = await generateModels(subdomain);
  const usersReport: any = {};
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

  const shiftsOfScheduleConfigIds = shiftsOfSchedule.map(
    scheduleShift => scheduleShift.scheduleConfigId
  );
  const scheduleShiftsConfigs = await models.ScheduleConfigs.find({
    _id: { $in: shiftsOfScheduleConfigIds }
  });

  const scheduleShiftConfigsMap: { [scheduleConfigId: string]: number } = {};

  scheduleShiftsConfigs.map(
    scheduleConfig =>
      (scheduleShiftConfigsMap[scheduleConfig._id] =
        scheduleConfig.lunchBreakInMins)
  );

  const schedulesObj = createSchedulesObj(
    userIds,
    schedules,
    shiftsOfSchedule,
    scheduleShiftConfigsMap
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
          let lunchBreakInHrs = 0;
          if (
            currUserId in schedulesObj &&
            scheduledDay in schedulesObj[currUserId]
          ) {
            const getScheduleOfTheDay = schedulesObj[currUserId][scheduledDay];

            scheduleShiftStart = getScheduleOfTheDay.shiftStart;
            scheduleShiftEnd = getScheduleOfTheDay.shiftEnd;
            lunchBreakInHrs = getScheduleOfTheDay.lunchBreakInMins / 60;

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

          let timeclockDurationinHrs = getTimeClockDuration / MMSTOHRS;
          let scheduledDurationInHrs = getScheduleDuration / MMSTOHRS;

          if (timeclockDurationinHrs) {
            timeclockDurationinHrs -= lunchBreakInHrs;
          }
          if (scheduledDurationInHrs) {
            scheduledDurationInHrs -= lunchBreakInHrs;
          }

          totalShiftsOfUser.push({
            timeclockDate: scheduledDay,
            timeclockStart: shiftStart,
            timeclockEnd: shiftEnd,
            timeclockDuration: timeclockDurationinHrs.toFixed(2),

            deviceType: currUserTimeclock.deviceType,
            deviceName: currUserTimeclock.deviceName,

            scheduledStart: scheduleShiftStart,
            scheduledEnd: scheduleShiftEnd,

            lunchBreakInHrs: lunchBreakInHrs.toFixed(2),
            scheduledDuration: scheduledDurationInHrs.toFixed(2),
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

const returnTotalAbsences = async (
  totalRequests: IAbsence[],
  models: IModels
): Promise<{
  requestsWorkedAbroad: IAbsence[];
  requestsPaidAbsence: IAbsence[];
  requestsUnpaidAbsence: IAbsence[];
  requestsSick: IAbsence[];
}> => {
  // get all paid absence types' ids except sick absence
  const paidAbsenceTypes = await models.AbsenceTypes.find({
    requestType: 'paid absence',
    name: { $not: /өвдсөн цаг/gi }
  });

  const paidAbsenceTypeIds = paidAbsenceTypes.map(
    paidAbsence => paidAbsence._id
  );

  // get all unpaid absence types' ids
  const unpaidAbsenceTypes = await models.AbsenceTypes.find({
    requestType: 'unpaid absence'
  });

  const unpaidAbsenceTypeIds = unpaidAbsenceTypes.map(
    unpaidAbsence => unpaidAbsence._id
  );

  // find Absences
  const requestsWorkedAbroad = totalRequests.filter(request =>
    request.reason.toLocaleLowerCase().includes('томилолт')
  );

  const requestsPaidAbsence = totalRequests.filter(request =>
    paidAbsenceTypeIds.includes(request.absenceTypeId || '')
  );

  const requestsUnpaidAbsence = totalRequests.filter(request =>
    unpaidAbsenceTypeIds.includes(request.absenceTypeId || '')
  );

  const requestsSick = totalRequests.filter(request =>
    request.reason.toLowerCase().includes('өвдсөн цаг')
  );

  return {
    requestsWorkedAbroad,
    requestsPaidAbsence,
    requestsUnpaidAbsence,
    requestsSick
  };
};

const returnUserAbsenceInfo = (
  relatedAbsences: any,
  relatedAbsenceTypes: IAbsenceTypeDocument[]
): IUserAbsenceInfo => {
  let totalHoursWorkedAbroad = 0;
  let totalHoursPaidAbsence = 0;
  let totalHoursUnpaidAbsence = 0;
  let totalHoursSick = 0;

  relatedAbsences.requestsWorkedAbroad.forEach(request => {
    totalHoursWorkedAbroad +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  relatedAbsences.requestsPaidAbsence.forEach(request => {
    const absenceType = relatedAbsenceTypes.find(
      absType => absType._id === request.absenceTypeId
    );

    if (absenceType && absenceType.requestTimeType === 'by day') {
      const getTotalDays = Math.ceil(
        (request.endTime.getTime() - request.startTime.getTime()) /
          (1000 * 3600 * 24)
      );
      totalHoursPaidAbsence += getTotalDays * absenceType.requestHoursPerDay;

      return;
    }
    totalHoursPaidAbsence +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  relatedAbsences.requestsUnpaidAbsence.forEach(request => {
    totalHoursUnpaidAbsence +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });
  relatedAbsences.requestsSick.forEach(request => {
    totalHoursSick +=
      (request.endTime.getTime() - request.startTime.getTime()) / MMSTOHRS;
  });

  return {
    totalHoursWorkedAbroad,
    totalHoursPaidAbsence,
    totalHoursUnpaidAbsence,
    totalHoursSick
  };
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
  totalScheduleShifts: IShiftDocument[],
  scheduleShiftsConfigsMap?: { [scheduleConfigId: string]: number }
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

        const getScheduleConfigId = currEmpScheduleShift.scheduleConfigId;

        const lunchBreakInMins =
          scheduleShiftsConfigsMap && getScheduleConfigId
            ? scheduleShiftsConfigsMap[getScheduleConfigId]
            : 0;

        returnObject[userId][date_key] = {
          lunchBreakInMins,
          shiftStart: currEmpScheduleShift.shiftStart,
          shiftEnd: currEmpScheduleShift.shiftEnd
        };
      });
    }
  }

  return returnObject;
};
