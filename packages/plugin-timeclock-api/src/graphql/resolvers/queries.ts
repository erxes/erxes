import { IContext } from '../../connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';
import { findBranch, findDepartment, returnReportByUserIds } from './utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import {
  IGroup,
  IReport,
  IUserReport
} from '../../models/definitions/timeclock';
import { generateFilter } from '../../utils';
import { paginate } from '@erxes/api-utils/src';

const timeclockQueries = {
  async absences(_root, queryParams, { models, subdomain }: IContext) {
    return models.Absences.find(
      await generateFilter(queryParams, subdomain, 'absence')
    );
  },

  absenceTypes(_root, {}, { models }: IContext) {
    return models.AbsenceTypes.find();
  },

  holidays(_root, {}, { models }: IContext) {
    return models.Absences.find({ status: 'Holiday' });
  },

  async timeclocksMain(_root, queryParams, { subdomain, models }: IContext) {
    const selector = await generateFilter(queryParams, subdomain, 'timeclock');
    const queryList = models.Timeclocks.find(selector);

    const list = paginate(models.Timeclocks.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    });

    const totalCount = queryList.countDocuments();
    return { list, totalCount };
  },
  async schedulesMain(_root, queryParams, { models, subdomain }: IContext) {
    const selector = await generateFilter(queryParams, subdomain, 'schedule');
    const totalCount = models.Schedules.find(selector).countDocuments();

    const list = paginate(models.Schedules.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    });

    return { list, totalCount };
  },

  async requestsMain(_root, queryParams, { models, subdomain }: IContext) {
    const selector = await generateFilter(queryParams, subdomain, 'absence');
    const totalCount = models.Absences.find(selector).countDocuments();

    const list = paginate(models.Absences.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    });

    return { list, totalCount };
  },

  payDates(_root, {}, { models }: IContext) {
    return models.PayDates.find();
  },

  timeclockDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Timeclocks.findOne({ _id });
  },

  absenceDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Absences.findOne({ _id });
  },

  scheduleDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Schedules.findOne({ _id });
  },

  async timeclockReportByUser(
    _root,
    { selectedUser },
    { models, user }: IContext
  ) {
    const userId = selectedUser || user._id;
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
    // get the schedule data of this month
    const schedules = models.Schedules.find({ userId: `${userId}` });
    const timeclocks = models.Timeclocks.find({
      $and: [
        { userId: `${userId}` },
        {
          shiftStart: {
            $gte: fixDate(startOfThisMonth),
            $lt: fixDate(startOfNextMonth)
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
            $gte: fixDate(startOfThisMonth),
            $lt: fixDate(startOfNextMonth)
          }
        }
      ]
    });

    for (const { _id } of await schedules) {
      shiftsOfSchedule.push(
        ...(await models.Shifts.find({
          $or: [
            { scheduleId: _id },
            { status: 'Approved' },
            {
              shiftStart: {
                $gte: fixDate(startOfThisMonth),
                $lt: fixDate(startOfNextMonth)
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
          userSchedule.scheduleEnd.getTime() -
          userSchedule.recordedEnd.getTime();

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
  },

  async timeclockReports(
    _root,
    { departmentIds, branchIds, userIds },
    { models, subdomain }: IContext
  ) {
    let department;
    const branchUsers: IGroup[] = [];
    const departmentUsers: IGroup[] = [];
    let branch;

    const finalReport: IReport[] = [];

    if (departmentIds || branchIds) {
      if (departmentIds) {
        for (const departmentId of departmentIds) {
          department = await findDepartment(subdomain, departmentId);
          departmentUsers.push({
            userIds: department.userIds,
            title: department.title
          });
        }
      }
      if (branchIds) {
        for (const branchId of branchIds) {
          branch = await findBranch(subdomain, branchId);
          branchUsers.push({ userIds: branch.userIds, title: branch.title });
        }
      }

      // if both branch and department ids are given
      if (branchIds && departmentIds) {
        const departmentUserIds: string[] = [];
        const branchUserIds: string[] = [];

        for (const deptUser of departmentUsers) {
          departmentUserIds.push(...deptUser.userIds);
        }
        for (const brnchUser of branchUsers) {
          branchUserIds.push(...brnchUser.userIds);
        }

        const commonUserIds = departmentUserIds.filter(x =>
          branchUserIds.includes(x)
        );

        const [
          reportsReturned,
          totalMinsLatePerGroup,
          totalAbsenceMinsPerGroup,
          totalWorkedMinsPerGroup
        ] = await returnReportByUserIds(models, commonUserIds);
        finalReport.push({
          groupReport: [...reportsReturned],
          groupTitle: '',
          groupTotalMinsLate: totalMinsLatePerGroup,
          groupTotalAbsenceMins: totalAbsenceMinsPerGroup,
          groupTotalMinsWorked: totalWorkedMinsPerGroup
        });
      } else {
        // for each department, push dept users' report with department title
        for (const dept of departmentUsers) {
          const departmentUserIds = [...dept.userIds];
          const [
            departmentReport,
            totalMinsLatePerGroup,
            totalAbsenceMinsPerGroup,
            totalWorkedMinsPerGroup
          ] = await returnReportByUserIds(models, departmentUserIds);

          finalReport.push({
            groupReport: departmentReport.slice(),
            groupTitle: dept.title,
            groupTotalMinsLate: totalMinsLatePerGroup,
            groupTotalAbsenceMins: totalAbsenceMinsPerGroup,
            groupTotalMinsWorked: totalWorkedMinsPerGroup
          });
        }

        // for each branch, push branch users' report with branch title
        for (const brnch of branchUsers) {
          const branchUserIds = [...brnch.userIds];
          const [
            branchReport,
            totalMinsLatePerGroup,
            totalAbsenceMinsPerGroup,
            totalWorkedMinsPerGroup,
            totalScheduledMinsPerGroup
          ] = await returnReportByUserIds(models, branchUserIds);
          finalReport.push({
            groupReport: [...branchReport],
            groupTitle: brnch.title,
            groupTotalMinsLate: totalMinsLatePerGroup,
            groupTotalAbsenceMins: totalAbsenceMinsPerGroup,
            groupTotalMinsWorked: totalWorkedMinsPerGroup,
            groupTotalMinsScheduled: totalScheduledMinsPerGroup
          });
        }
      }
    }

    return finalReport;
  }
};

// moduleRequireLogin(timeclockQueries);

export default timeclockQueries;
