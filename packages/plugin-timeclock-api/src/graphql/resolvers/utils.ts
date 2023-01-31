import { fixDate } from '@erxes/api-utils/src';
import { generateModels, IModels } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IUserReport, IUsersReport } from '../../models/definitions/timeclock';

export const findDepartment = async (subdomain: string, target) => {
  const department = await sendCoreMessage({
    subdomain,
    action: 'departments.findOne',
    data: { _id: target },
    isRPC: true
  });

  return department;
};

export const findBranch = async (subdomain: string, target) => {
  const branch = await sendCoreMessage({
    subdomain,
    action: 'branches.findOne',
    data: { _id: target },
    isRPC: true
  });

  return branch;
};

export const findBranches = async (subdomain: string, userId: string) => {
  const branches = await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { userIds: userId } },
    isRPC: true
  });

  return branches;
};

export const createScheduleShiftsByUserIds = async (
  userIds: string[],
  shifts,
  models: IModels,
  scheduleConfigId?: string
) => {
  let schedule;
  userIds.forEach(async userId => {
    schedule = await models.Schedules.createSchedule({
      userId: `${userId}`,
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
      userId: `${userId}`
    });
    const timeclocks = models.Timeclocks.find({
      userId: `${userId}`
    });
    const absences = models.Absences.find({
      userId: `${userId}`,
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
        userId: `${userId}`,
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
  const schedules = models.Schedules.find({ userId: `${userId}` });
  const timeclocks = models.Timeclocks.find({
    $and: [
      { userId: `${userId}` },
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
        userId: `${userId}`,
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

export const timeclockReportPreliminary = async (
  subdomain: string,
  userIds: string[],
  startDate?: string,
  endDate?: string,
  teamMembersObj?: any,
  reportType?: string
) => {
  const models = await generateModels(subdomain);

  const usersReport: IUsersReport = {};
  const shiftsOfSchedule: any = [];

  const NOW = new Date();
  // get 1st of this month
  const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  // get 1st of the next Month
  const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1);

  const startTime = startDate ? startDate : startOfThisMonth;
  const endTime = endDate ? endDate : startOfNextMonth;

  // get the schedule data of this month
  const schedules = await models.Schedules.find({
    userId: { $in: userIds }
  }).sort({
    userId: 1
  });

  const timeclocks = await models.Timeclocks.find({
    $and: [
      { userId: { $in: userIds } },
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
  }).sort({ userId: 1 });

  for (const { _id } of schedules) {
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

  userIds.forEach(async currUserId => {
    // assign team member info from teamMembersObj

    if (reportType === 'xlsx') {
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

    let totalDaysWorkedThisMonthPerUser = 0;
    let totalDaysScheduledThisMonthPerUser = 0;

    if (currUserTimeclocks) {
      totalDaysWorkedThisMonthPerUser = new Set(
        currUserTimeclocks.map(shift =>
          new Date(shift.shiftStart).toLocaleDateString()
        )
      ).size;
    }
    if (currUserScheduleShifts) {
      totalDaysScheduledThisMonthPerUser += new Set(
        currUserScheduleShifts.map(shiftOfSchedule =>
          new Date(shiftOfSchedule.shiftStart).toLocaleDateString()
        )
      ).size;
    }

    if (reportType === 'xlsx') {
      usersReport[
        currUserId
      ].totalDaysScheduledThisMonth = totalDaysScheduledThisMonthPerUser;
      usersReport[
        currUserId
      ].totalDaysWorkedThisMonth = totalDaysWorkedThisMonthPerUser;
    } else {
      usersReport[currUserId] = {
        totalDaysScheduledThisMonth: totalDaysScheduledThisMonthPerUser,
        totalDaysWorkedThisMonth: totalDaysWorkedThisMonthPerUser
      };
    }
  });

  return usersReport;
};
