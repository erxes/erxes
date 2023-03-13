import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';
import {
  findAllTeamMembers,
  generateCommonUserIds,
  paginateArray
} from '../../utils';
import {
  bichilTimeclockReportFinal,
  bichilTimeclockReportPivot,
  bichilTimeclockReportPreliminary
} from './utils';
import { IReport } from '../../models/definitions/timeclock';

const bichilQueries = {
  bichils(_root, _args, _context: IContext) {
    return Bichils.find({});
  },

  async bichilTimeclockReport(
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
    { subdomain, models }: IContext
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

    const teamMembers = await findAllTeamMembers(subdomain);
    const teamMemberIds: string[] = [];

    for (const teamMember of teamMembers) {
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
        const reportPreliminary: any = await bichilTimeclockReportPreliminary(
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
        const reportFinal: any = await bichilTimeclockReportFinal(
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
        const reportPivot: any = await bichilTimeclockReportPivot(
          subdomain,
          paginateArray(totalTeamMemberIds, perPage, page),
          startDate,
          endDate,
          false
        );

        for (const userId of Object.keys(reportPivot)) {
          if (userId !== 'scheduleReport') {
            returnReport.push({
              groupReport: [{ userId, ...reportPivot[userId] }]
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

export default bichilQueries;
