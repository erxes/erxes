import { IContext } from '../../connectionResolver';
import {
  timeclockReportByUser,
  timeclockReportFinal,
  timeclockReportPivot,
  timeclockReportPreliminary
} from './utils';
import {
  findAllTeamMembersWithEmpId,
  generateCommonUserIds,
  generateFilter
} from '../../utils';
import { paginate } from '@erxes/api-utils/src';
import { IReport } from '../../models/definitions/timeclock';

const paginateArray = (array, perPage = 20, page = 1) =>
  array.slice((page - 1) * perPage, page * perPage);

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

    const list = paginate(
      models.Timeclocks.find(selector).sort({
        shiftStart: -1
      }),
      {
        perPage: queryParams.perPage,
        page: queryParams.page
      }
    );

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

  async scheduleConfigs(_root, {}, { models, subdomain }: IContext) {
    return models.ScheduleConfigs.find();
  },

  async requestsMain(_root, queryParams, { models, subdomain }: IContext) {
    const selector = await generateFilter(queryParams, subdomain, 'absence');
    const totalCount = models.Absences.find(selector).countDocuments();

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
    const totalTeamMemberIds = teamMemberIdsFromFilter.length
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
            groupReport: [{ userId: `${userId}`, ...reportPreliminary[userId] }]
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
            groupReport: [{ userId: `${userId}`, ...reportFinal[userId] }]
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
          if (userId !== 'scheduleReport') {
            returnReport.push({
              groupReport: [{ userId: `${userId}`, ...reportPivot[userId] }]
            });
          }
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
