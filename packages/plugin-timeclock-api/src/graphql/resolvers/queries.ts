import { IContext } from '../../connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';
import {
  findAllBranches,
  findBranch,
  findDepartment
} from '../../departments.';
import {
  ISchedule,
  IScheduleDocument,
  ITimeClock,
  ITimeClockDocument
} from '../../models/definitions/template';

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

  async timeclockReports(
    _root,
    { departmentId, branchId },
    { models, subdomain }: IContext
  ) {
    let department;
    let branchUserIds;
    let departmentUserIds;
    let branch;

    interface IReport {
      userId: string;
      schedule: any;
      recordedShift: any;
    }

    const reports: IReport[] = [];

    if (departmentId) {
      department = await findDepartment(subdomain, departmentId);
      departmentUserIds = department.userIds;

      for (const userId of departmentUserIds) {
        const schedules = models.Schedules.find({ userId: `${userId}` });
        const timeclocks = models.Templates.find({ userId: `${userId}` });
        reports.push({
          userId: `${userId}`,
          schedule: schedules,
          recordedShift: timeclocks
        });
      }
    }
    if (branchId) {
      branch = await findBranch(subdomain, branchId);
      branchUserIds = branch.userIds;

      for (const userId of branchUserIds) {
        const schedules = models.Schedules.find({ userId: `${userId}` });
        const timeclocks = models.Templates.find({ userId: `${userId}` });
        reports.push({
          userId: `${userId}`,
          schedule: schedules,
          recordedShift: timeclocks
        });
      }
    }

    return reports;
  },

  async branches(
    _root,
    { searchValue }: { searchValue: string },
    { models, subdomain }: IContext
  ) {
    const branches = findAllBranches(subdomain, searchValue);
    return branches;
  }
};

export default templateQueries;
