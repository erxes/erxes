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
  generateFilter
} from '../../utils';
import { IReport } from '../../models/definitions/timeclock';
import { fixDate, paginate } from '@erxes/api-utils/src';

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

  timeclocksPerUser(
    _root,
    { userId, startDate, endDate },
    { models }: IContext
  ) {
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

    return models.Timeclocks.find({ $and: [{ userId }, timeField] });
  },

  async timeclocksMain(_root, queryParams, { subdomain, models }: IContext) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'timeclock'
    );

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = models.Timeclocks.count(selector);

    const list = paginate(
      models.Timeclocks.find(selector).sort({
        shiftStart: -1
      }),
      {
        perPage: queryParams.perPage,
        page: queryParams.page
      }
    );

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

  async timelogsMain(_root, queryParams, { subdomain, models }: IContext) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'timelog'
    );
    const totalCount = models.TimeLogs.count(selector);

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const list = paginate(
      models.TimeLogs.find(selector).sort({ userId: 1, timelog: -1 }),
      { perPage: queryParams.perPage, page: queryParams.page }
    );

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

  async schedulesMain(_root, queryParams, { models, subdomain }: IContext) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'schedule'
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
    return models.Schedules.find({ userId: getUserId });
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

  async requestsMain(_root, queryParams, { models, subdomain }: IContext) {
    const [selector, commonUserFound] = await generateFilter(
      queryParams,
      subdomain,
      'absence'
    );
    const totalCount = models.Absences.count(selector);

    // if there's no common user, return empty list
    if (!commonUserFound) {
      return { list: [], totalCount: 0 };
    }

    const list = paginate(
      models.Absences.find(selector).sort({ startTime: -1 }),
      {
        perPage: queryParams.perPage,
        page: queryParams.page
      }
    );

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
    { selectedUser },
    { subdomain, user }: IContext
  ) {
    const userId = selectedUser || user._id;
    return timeclockReportByUser(userId, subdomain);
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
      reportType
    },
    { subdomain }: IContext
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

    const teamMembersWithIds = await findAllTeamMembersWithEmpId(subdomain);
    const teamMemberIds: string[] = [];

    for (const teamMember of teamMembersWithIds) {
      if (!teamMember.employeeId) {
        continue;
      }

      teamMemberIds.push(teamMember._id);
    }
    const totalTeamMemberIds =
      teamMemberIdsFromFilter.length || filterGiven
        ? teamMemberIdsFromFilter
        : teamMemberIds;

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

// moduleRequireLogin(timeclockQueries);

export default timeclockQueries;
