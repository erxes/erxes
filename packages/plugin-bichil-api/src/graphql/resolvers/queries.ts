import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';
import {
  findAllTeamMembers,
  findAllTeamMembersWithEmpId,
  findTeamMembers,
  generateCommonUserIds,
  paginateArray,
  returnDepartmentsBranchesDict,
  returnSupervisedUsers
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
      reportType,
      isCurrentUserAdmin
    },
    { subdomain, user }: IContext
  ) {
    let filterGiven = false;
    let totalTeamMemberIds;
    let totalMembers;

    const totalBranchIdsOfMembers: string[] = [];
    const totalDeptIdsOfMembers: string[] = [];

    type Structure = {
      departmentIds: string[];
      branchIds: string[];
    };

    const usersStructure: { [userId: string]: Structure } = {};

    if (userIds || branchIds || departmentIds) {
      filterGiven = true;
    }

    if (filterGiven) {
      totalTeamMemberIds = await generateCommonUserIds(
        subdomain,
        userIds,
        branchIds,
        departmentIds
      );

      totalMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
    } else {
      if (isCurrentUserAdmin) {
        // return all team member ids
        totalMembers = await findAllTeamMembers(subdomain);
        totalTeamMemberIds = totalMembers.map(usr => usr._id);
      } else {
        // return supervisod users including current user
        totalMembers = await returnSupervisedUsers(user, subdomain);
        totalTeamMemberIds = totalMembers.map(usr => usr._id);
      }
    }

    const returnReport: IReport[] = [];
    let deductionInfo;

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
        const paginatedTeamMembers = paginateArray(totalMembers, perPage, page);
        const paginatedTeamMemberIds = paginatedTeamMembers.map(e => e._id);

        for (const teamMember of paginatedTeamMembers) {
          if (teamMember.branchIds) {
            totalBranchIdsOfMembers.push(...teamMember.branchIds);
          }

          if (teamMember.departmentIds) {
            totalDeptIdsOfMembers.push(...teamMember.departmentIds);
          }

          usersStructure[teamMember._id] = {
            branchIds: teamMember.branchIds ? teamMember.branchIds : [],
            departmentIds: teamMember.departmentIds
              ? teamMember.departmentIds
              : []
          };
        }

        const structuresDict = await returnDepartmentsBranchesDict(
          subdomain,
          totalBranchIdsOfMembers,
          totalDeptIdsOfMembers
        );

        const reportFinal: any = await bichilTimeclockReportFinal(
          subdomain,
          paginatedTeamMemberIds,
          startDate,
          endDate,
          false
        );

        const getReport = reportFinal.report;
        deductionInfo = reportFinal.deductionInfo;

        const groupedByBranch: { [branchTitle: string]: any } = {};

        for (const userId of Object.keys(getReport)) {
          const userBranchIds = usersStructure[userId].branchIds;
          const branchTitles: string[] = [];

          for (const userBranchId of userBranchIds) {
            if (structuresDict[userBranchId]) {
              branchTitles.push(structuresDict[userBranchId]);
            }
          }

          for (const userBranchTitle of branchTitles) {
            if (userBranchTitle in groupedByBranch) {
              groupedByBranch[userBranchTitle] = [
                ...groupedByBranch[userBranchTitle],
                { userId, ...getReport[userId] }
              ];
              continue;
            }

            groupedByBranch[userBranchTitle] = [
              { userId, ...getReport[userId] }
            ];
          }
        }

        for (const branchTitle of Object.keys(groupedByBranch)) {
          returnReport.push({
            groupTitle: branchTitle,
            groupReport: groupedByBranch[branchTitle]
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
      totalCount: totalTeamMemberIds.length,
      ...deductionInfo
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

  bichilSalarySymbols(_root, _args, _context: IContext) {
    const symbmols: any = {};
    const exclude = ['createdAt', 'createdBy'];

    Object.keys(salarySchema.paths).forEach(path => {
      if (
        salarySchema.paths[path].options.symbol === undefined ||
        exclude.includes(path)
      ) {
        return;
      }
      symbmols[path] = salarySchema.paths[path].options.symbol;
    });

    return symbmols;
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
