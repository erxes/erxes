import { IContext } from '../../connectionResolver';
import { findBranches, timeclockReportByUser } from './utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import {
  findAllTeamMembersWithEmpId,
  generateCommonUserIds,
  generateFilter
} from '../../utils';
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

    const list = paginate(
      models.Timeclocks.find(selector).sort({
        userId: 1,
        shiftStart: 1,
        shfitEnd: 1
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

    const list = paginate(models.Schedules.find(selector).sort({ userId: 1 }), {
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
      models.Absences.find(selector).sort({ userId: 1, startTime: 1 }),
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
    { userIds, branchIds, departmentIds, startDate, endDate, reportType },
    { subdomain }: IContext
  ) {
    const finalReport: any = [];

    const teamMembersWithEmpId = await findAllTeamMembersWithEmpId(subdomain);

    const teamMemberIdsFromFilter = await generateCommonUserIds(
      subdomain,
      userIds,
      branchIds,
      departmentIds
    );

    const totalTeamMemberIds = teamMemberIdsFromFilter.length
      ? teamMemberIdsFromFilter
      : teamMembersWithEmpId.map(teamMember => teamMember._id);

    for (const teamMemberId of totalTeamMemberIds) {
      const userReport = await timeclockReportByUser(
        teamMemberId,
        subdomain,
        startDate,
        endDate
      );
      const userBranches = await findBranches(subdomain, teamMemberId);

      finalReport.push({
        groupTitle: userBranches.length && userBranches[0].title,
        groupReport: [userReport]
      });
    }

    return finalReport;
  }
};

// moduleRequireLogin(timeclockQueries);

export default timeclockQueries;
