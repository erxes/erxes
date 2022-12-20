import { IModels } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IUserReport } from '../../models/definitions/timeclock';

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
    console.log(userReport);
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
