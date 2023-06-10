import { IContext } from '../../connectionResolver';
import {
  paginateArray,
  timeclockReportByUser,
  timeclockReportFinal,
  timeclockReportPivot,
  timeclockReportPreliminary
} from './utils';
import {
  customFixDate,
  findAllTeamMembersWithEmpId,
  generateCommonUserIds,
  generateFilter,
  returnSupervisedUsers
} from '../../utils';
import { IReport } from '../../models/definitions/timeclock';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { fixDate, paginate } from '@erxes/api-utils/src';
import { sendCoreMessage } from '../../messageBroker';

const timeclockQueries = {
  async absences(_root, queryParams, { models, subdomain, user }: IContext) {
    return models.Absences.find(
      await generateFilter(queryParams, subdomain, 'absence', user)
    );
  },

  absenceTypes(_root, {}, { models }: IContext) {
    return models.AbsenceTypes.find();
  },

  holidays(_root, {}, { models }: IContext) {
    return models.Absences.find({ status: 'Holiday' });
  },

  // show supervisod branches, departments, users of those only
  timeclockBranches(_root, {}, { subdomain, user }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: `branches.find`,
      data: {
        query: {
          supervisorId: user._id
        }
      },
      isRPC: true,
      defaultValue: []
    });
  },

  timeclockDepartments(_root, {}, { subdomain, user }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: `departments.find`,
      data: {
        supervisorId: user._id
      },
      isRPC: true,
      defaultValue: []
    });
  },

  timeclocksPerUser(
    _root,
    { userId, startDate, endDate, shiftActive },
    { models, user }: IContext
  ) {
    const getUserId = userId || user._id;

    const timeField = {
      $or: [
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
      ]
    };

    const selector: any = [{ userId: getUserId }, timeField];

    if (shiftActive) {
      selector.push({ shiftActive });
    }

    return models.Timeclocks.find({ $and: selector });
  },

  async timeclocksMain(
    _root,
    queryParams,
    { subdomain, models, user }: IContext
  ) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'timeclock',
      user
    );

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = models.Timeclocks.count(selector);

    const list = paginate(models.Timeclocks.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    })
      .sort({
        shiftStart: -1
      })
      .limit(queryParams.perPage || 20);

    return { list, totalCount };
  },

  async timeclockActivePerUser(_root, { userId }, { user, models }: IContext) {
    const getUserId = userId || user._id;

    // return the latest started active shift
    const getActiveTimeclock = await models.Timeclocks.find({
      userId: getUserId,
      shiftActive: true
    })
      .sort({ shiftStart: 1 })
      .limit(1);

    return getActiveTimeclock.pop();
  },

  async timelogsMain(
    _root,
    queryParams,
    { subdomain, models, user }: IContext
  ) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'timelog',
      user
    );
    const totalCount = models.TimeLogs.count(selector);

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const list = paginate(models.TimeLogs.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    })
      .sort({ userId: 1, timelog: -1 })
      .limit(queryParams.perPage || 20);

    return { list, totalCount };
  },

  timeLogsPerUser(_root, { userId, startDate, endDate }, { models }: IContext) {
    const timeField = {
      timelog: {
        $gte: fixDate(startDate),
        $lte: customFixDate(endDate)
      }
    };

    return models.TimeLogs.find({
      $and: [{ userId }, timeField]
    }).sort({ timelog: 1 });
  },

  async schedulesMain(
    _root,
    queryParams,
    { models, subdomain, user }: IContext
  ) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'schedule',
      user
    );
    const totalCount = models.Schedules.count(selector);

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const list = paginate(models.Schedules.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    });

    return { list, totalCount };
  },

  schedulesPerUser(_root, queryParams, { models, user }: IContext) {
    const getUserId = queryParams.userId || user._id;
    return models.Schedules.find({ userId: getUserId, status: 'Approved' });
  },

  scheduleConfigs(_root, {}, { models }: IContext) {
    return models.ScheduleConfigs.find();
  },

  deviceConfigs(_root, queryParams, { models }: IContext) {
    const totalCount = models.DeviceConfigs.count({});

    const list = paginate(models.DeviceConfigs.find(), {
      perPage: queryParams.perPage,
      page: queryParams.page
    });

    return { list, totalCount };
  },

  async requestsMain(
    _root,
    queryParams,
    { models, subdomain, user }: IContext
  ) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'absence',
      user
    );
    const totalCount = models.Absences.count(selector);

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const list = paginate(models.Absences.find(selector), {
      perPage: queryParams.perPage,
      page: queryParams.page
    }).sort({ startTime: -1 });

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

  checkedReportsPerUser(_root, doc, { models, user }: IContext) {
    const userId = doc.userId || user._id;
    return models.ReportChecks.find({ userId });
  },

  async timeclockReportByUser(
    _root,
    { selectedUser, selectedMonth, selectedYear, selectedDate },
    { subdomain, user }: IContext
  ) {
    const userId = selectedUser || user._id;

    return timeclockReportByUser(
      subdomain,
      userId,
      selectedMonth,
      selectedYear,
      selectedDate
    );
  },

  async timeclockReports(
    _root,
    {
      userIds,
      branchIds,
      departmentIds,
      startDate,
      endDate,
      page,
      perPage,
      reportType,
      isCurrentUserAdmin
    },
    { subdomain, user }: IContext
  ) {
    let filterGiven = false;
    if (userIds || branchIds || departmentIds) {
      filterGiven = true;
    }
    const teamMemberIdsFromFilter = await generateCommonUserIds(
      subdomain,
      userIds,
      branchIds,
      departmentIds
    );

    const returnReport: IReport[] = [];

    const totalSupervisedUserIds = await returnSupervisedUsers(
      user._id,
      subdomain
    );

    const totalUserIds = (await findAllTeamMembersWithEmpId(subdomain)).map(
      returnedUser => returnedUser._id
    );

    const totalTeamMemberIds = filterGiven
      ? teamMemberIdsFromFilter
      : isCurrentUserAdmin
      ? totalUserIds
      : totalSupervisedUserIds;

    switch (reportType) {
      case 'Урьдчилсан' || 'Preliminary':
        const reportPreliminary: any = await timeclockReportPreliminary(
          subdomain,
          paginateArray(totalTeamMemberIds, perPage, page),
          startDate,
          endDate,
          false
        );

        for (const userId of Object.keys(reportPreliminary)) {
          returnReport.push({
            groupReport: [{ userId, ...reportPreliminary[userId] }]
          });
        }

        break;
      case 'Сүүлд' || 'Final':
        const reportFinal: any = await timeclockReportFinal(
          subdomain,
          paginateArray(totalTeamMemberIds, perPage, page),
          startDate,
          endDate,
          false
        );
        for (const userId of Object.keys(reportFinal)) {
          returnReport.push({
            groupReport: [{ userId, ...reportFinal[userId] }]
          });
        }
        break;
      case 'Pivot':
        const reportPivot: any = await timeclockReportPivot(
          subdomain,
          paginateArray(totalTeamMemberIds, perPage, page),
          startDate,
          endDate,
          false
        );

        for (const userId of Object.keys(reportPivot)) {
          returnReport.push({
            groupReport: [{ userId, ...reportPivot[userId] }]
          });
        }
        break;
    }

    return {
      list: returnReport,
      totalCount: totalTeamMemberIds.length
    };
  }
};

moduleRequireLogin(timeclockQueries);
// checkPermission(timeclockQueries, 'timeclocksMain', 'showTimeclocks');

export default timeclockQueries;
