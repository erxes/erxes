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
import { paginate } from '@erxes/api-utils/src/core';
import { IReport } from '../../models/definitions/timeclock';
import { salarySchema } from '../../models/definitions/salary';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { sendCommonMessage } from '../../messageBroker';

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
  },

  async bichilSalaryReport(_root, args: any, { models }: IContext) {
    const { page, perPage, employeeId } = args;

    const qry: any = {};

    if (employeeId) {
      qry.employeeId = employeeId;
    }

    const list = await paginate(models.Salaries.find(qry), { page, perPage });
    const totalCount = await models.Salaries.find(qry).countDocuments();

    return { list, totalCount };
  },

  bichilSalaryLabels(_root, _args, _context: IContext) {
    const labels: any = {};
    const exclude = ['createdAt', 'createdBy'];

    Object.keys(salarySchema.paths).forEach(path => {
      if (
        salarySchema.paths[path].options.label === undefined ||
        exclude.includes(path)
      ) {
        return;
      }
      labels[path] = salarySchema.paths[path].options.label;
    });

    return labels;
  },

  async bichilSalaryByEmployee(
    _root,
    args: { password: string; page: number; perPage: number },
    { models, user, subdomain }: IContext
  ) {
    const { password, page = 1, perPage = 20 } = args;
    const employee = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'users.findOne',
      data: {
        _id: user._id
      },
      isRPC: true,
      defaultValue: null
    });

    const checkPassword = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'users.comparePassword',
      data: {
        password,
        userPassword: employee.password
      },
      isRPC: true,
      defaultValue: false
    });

    if (!checkPassword) {
      throw new Error('Нууц үг буруу байна');
    }

    const list = await paginate(
      models.Salaries.find({ employeeId: employee.employeeId }),
      { page, perPage }
    );

    const totalCount = await models.Salaries.find({
      employeeId: employee.employeeId
    }).countDocuments();

    return { list, totalCount };
  }
};

requireLogin(bichilQueries, 'bichilSalaryReport');
requireLogin(bichilQueries, 'bichilSalaryByEmployee');

checkPermission(bichilQueries, 'bichilSalaryReport', 'showSalaries', []);

export default bichilQueries;
