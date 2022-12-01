import { IContext } from '../../connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';
import { findBranch, findDepartment } from '../../departments';
import schedule from './schedule';
import { title } from 'process';

const templateQueries = {
  absences(
    _root,
    {
      startDate,
      endDate,
      userId
    }: { startDate: Date; endDate: Date; userId: string },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };
    const timeFields = [
      {
        startTime: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      },
      {
        endTime: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      }
    ];

    if (startDate && endDate) {
      selector.$or = timeFields;
    }
    if (userId) {
      selector.userId = userId;
    }

    return models.Absences.find(selector);
  },

  timeclocks(
    _root,
    {
      startDate,
      endDate,
      userId
    }: { startDate: Date; endDate: Date; userId: string },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };

    const timeFields = [
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      },
      {
        shiftEnd: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      }
    ];

    if (startDate && endDate) {
      selector.$or = timeFields;
    }
    if (userId) {
      selector.userId = userId;
    }

    return models.Templates.find(selector);
  },

  async schedules(
    _root,
    { startDate, endDate, userId },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };

    if (userId) {
      selector.userId = userId;
    }

    const schedules = await models.Schedules.find(selector);
    return schedules;
  },

  timeclockDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Templates.findOne({ _id });
  },

  absenceDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Absences.findOne({ _id });
  },

  scheduleDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Schedules.findOne({ _id });
  },

  // async returnUserIdsOfBranches(
  //   _root,
  //   { branchIds }: { branchIds: string[] },
  //   { models, subdomain }: IContext
  // ) {
  //   const finalUserIds: string[] = [];
  //   for (const branchId of branchIds) {
  //     const branch = await findBranch(subdomain, branchId);
  //     finalUserIds.push(branch.userIds);
  //   }
  //   return finalUserIds;
  // },

  async timeclockReports(
    _root,
    { departmentIds, branchIds },
    { models, subdomain }: IContext
  ) {
    let department;
    const branchUsers: IGroup[] = [];
    const departmentUsers: IGroup[] = [];
    let branch;

    interface IGroup {
      userIds: string[];
      title: string;
    }

    interface IReport {
      groupTitle: string;
      groupReport: IUserReport[];
      groupTotalMinsWorked?: number;
      groupTotalMinsLate?: number;
      groupTotalAbsenceMins?: number;
    }

    interface IUserReport {
      userId?: string;
      scheduleReport: IScheduleReport[];
      totalMinsWorked?: number;
      totalMinsLate?: number;
      totalAbsenceMins?: number;
    }

    interface IScheduleReport {
      date?: string;
      scheduleStart?: Date;
      scheduleEnd?: Date;
      recordedStart?: Date;
      recordedEnd?: Date;
      minsLate?: number;
      minsWorked?: number;
    }

    const finalReport: IReport[] = [];

    const returnReportByUserIds = async (
      userIds: string[]
    ): Promise<[IUserReport[], number, number, number]> => {
      let idx = 0;
      const reports: IUserReport[] = [];
      let groupTotalAbsence = 0;
      let groupTotalMinsWorked = 0;

      for (const userId of userIds) {
        const schedules = models.Schedules.find({ userId: `${userId}` });
        const timeclocks = models.Templates.find({ userId: `${userId}` });
        const absences = models.Absences.find({
          userId: `${userId}`,
          status: 'Approved'
        });
        const shifts_of_schedule: any = [];

        for (const { _id } of await schedules) {
          shifts_of_schedule.push(
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
          reports.push({ userId: `${userId}`, scheduleReport: [] });

          let totalMinsWorkedPerUser = 0;

          for (const timeclock of await timeclocks) {
            const previousSchedules = reports[idx].scheduleReport;

            const shiftDuration =
              timeclock.shiftEnd &&
              timeclock.shiftStart &&
              Math.round(
                (timeclock.shiftEnd.getTime() -
                  timeclock.shiftStart.getTime()) /
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

          for (const scheduleShift of shifts_of_schedule) {
            let found = false;
            const scheduleDateString = new Date(
              scheduleShift.shiftStart
            ).toDateString();

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
                (absence.endTime.getTime() - absence.startTime.getTime()) /
                60000;
            }
          }
          reports[idx] = {
            ...reports[idx],
            totalAbsenceMins: Math.trunc(totalAbsencePerUser),
            totalMinsWorked: totalMinsWorkedPerUser
          };

          groupTotalMinsWorked += totalMinsWorkedPerUser;
          groupTotalAbsence += Math.trunc(totalAbsencePerUser);
          idx += 1;
        }
      }
      let groupTotalMinsLate = 0;

      //  calculate how many mins late per user
      reports.forEach((userReport, group_report_idx) => {
        let totalMinsLatePerUser = 0;
        userReport.scheduleReport.forEach((userSchedule, user_report_idx) => {
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
            userReport.scheduleReport[user_report_idx] = {
              ...userSchedule,
              minsLate: sumMinsLate
            };
          }
        });

        groupTotalMinsLate += totalMinsLatePerUser;
        reports[group_report_idx] = {
          ...userReport,
          totalMinsLate: totalMinsLatePerUser
        };
      });

      return [
        reports,
        groupTotalMinsLate,
        groupTotalAbsence,
        groupTotalMinsWorked
      ];
    };

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
        ] = await returnReportByUserIds(commonUserIds);
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
          ] = await returnReportByUserIds(departmentUserIds);

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
            totalWorkedMinsPerGroup
          ] = await returnReportByUserIds(branchUserIds);
          finalReport.push({
            groupReport: [...branchReport],
            groupTitle: brnch.title,
            groupTotalMinsLate: totalMinsLatePerGroup,
            groupTotalAbsenceMins: totalAbsenceMinsPerGroup,
            groupTotalMinsWorked: totalWorkedMinsPerGroup
          });
        }
      }
    }

    return finalReport;
  }
};

export default templateQueries;
