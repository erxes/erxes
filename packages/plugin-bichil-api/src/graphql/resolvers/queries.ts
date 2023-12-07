import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';
import {
  findAllTeamMembers,
  findBranchUsers,
  findBranches,
  findSubBranches,
  findTeamMembers,
  findTimeclockTeamMemberIds,
  generateCommonUserIds,
  paginateArray,
  returnDepartmentsBranchesDict,
  returnSupervisedUsers
} from '../../utils';
import {
  bichilTimeclockReportFinal,
  bichilTimeclockReportPivot,
  bichilTimeclockReportPreliminary,
  timeclockReportByUsers
} from './utils';
import { paginate } from '@erxes/api-utils/src/core';
import { IReport } from '../../models/definitions/timeclock';
import { salarySchema } from '../../models/definitions/salary';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { sendCommonMessage } from '../../messageBroker';
import { IUserDocument } from '@erxes/api-utils/src/types';

const bichilQueries = {
  bichils(_root, _args, _context: IContext) {
    return Bichils.find({});
  },

  async bichilTimeclockReportByUsers(
    _root,
    {
      userIds,
      branchIds,
      departmentIds,
      startDate,
      endDate,
      page,
      perPage,
      isCurrentUserAdmin
    },
    { subdomain, models, user }: IContext
  ) {
    let filterGiven = false;
    let totalTeamMemberIds;
    let totalTeamMembers;

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

      totalTeamMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
    } else {
      if (isCurrentUserAdmin) {
        // return all team member ids
        totalTeamMemberIds = await findTimeclockTeamMemberIds(
          models,
          startDate,
          endDate
        );
        totalTeamMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
      } else {
        // return supervisod users including current user
        totalTeamMembers = await returnSupervisedUsers(user, subdomain);
        totalTeamMemberIds = totalTeamMembers.map(usr => usr._id);
      }
    }

    return {
      list: await timeclockReportByUsers(
        paginateArray(totalTeamMemberIds, perPage, page),
        models,
        { startDate, endDate }
      ),
      totalCount: totalTeamMemberIds.length
    };
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

    const branchIdsGivenOnly = !departmentIds && !userIds && branchIds;

    let totalTeamMemberIds;
    let totalTeamMembers;

    const totalBranchIdsOfMembers: string[] = [];
    const totalDeptIdsOfMembers: string[] = [];

    type Structure = {
      departmentIds: string[];
      branchIds: string[];
    };

    const usersStructure: { [userId: string]: Structure } = {};
    const branchesReportStructure: {
      [branchTitle: string]: IUserDocument[];
    } = {};

    const parentBranchesDict: { [branchId: string]: string } = {};

    if (userIds || branchIds || departmentIds) {
      filterGiven = true;
    }

    if (branchIdsGivenOnly) {
      const totalUsers: IUserDocument[] = [];
      const totalUserIds: string[] = [];

      const getParentBranches = await findBranches(subdomain, branchIds);

      for (const branchId of branchIds) {
        const getSubBranches = await findSubBranches(subdomain, branchId);
        const subBranchIds = getSubBranches.map(b => b._id);

        const totalBranchIds = [branchId, ...subBranchIds];
        const branchUsers = await findBranchUsers(subdomain, totalBranchIds);
        const parentBranch = getParentBranches.filter(p => p._id === branchId);

        for (const subBranchId of subBranchIds) {
          parentBranchesDict[subBranchId] = parentBranch[0].title;
        }

        branchesReportStructure[parentBranch.title] = branchUsers.map(
          b => b._id
        );

        totalUserIds.push(...branchUsers.map(u => u._id));
        totalUsers.push(...branchUsers);
      }

      totalTeamMembers = totalUsers;
      totalTeamMemberIds = totalUserIds;
    } else {
      if (filterGiven) {
        totalTeamMemberIds = await generateCommonUserIds(
          subdomain,
          userIds,
          branchIds,
          departmentIds
        );

        totalTeamMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
      } else {
        if (isCurrentUserAdmin) {
          // return all team member ids
          totalTeamMembers = await findAllTeamMembers(subdomain);
          totalTeamMemberIds = totalTeamMembers.map(usr => usr._id);
        } else {
          // return supervisod users including current user
          totalTeamMembers = await returnSupervisedUsers(user, subdomain);
          totalTeamMemberIds = totalTeamMembers.map(usr => usr._id);
        }
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
        const paginatedTeamMembers = paginateArray(
          totalTeamMembers,
          perPage,
          page
        );
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

        let structuresDict = await returnDepartmentsBranchesDict(
          subdomain,
          Array.from(new Set(totalBranchIdsOfMembers)),
          Array.from(new Set(totalDeptIdsOfMembers))
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
          const userBranchTitleToIdDict: { [branchTitle: string]: string } = {};
          const userBranchTitles: any[] = userBranchIds.map(branchId => {
            if (structuresDict[branchId]) {
              userBranchTitleToIdDict[
                structuresDict[branchId].title
              ] = branchId;
              return structuresDict[branchId].title;
            }
          });

          for (const userBranchTitle of userBranchTitles) {
            if (userBranchTitle in groupedByBranch) {
              groupedByBranch[userBranchTitle].report = [
                ...groupedByBranch[userBranchTitle].report,
                { userId, ...getReport[userId] }
              ];
              continue;
            }

            const branchId = userBranchTitleToIdDict[userBranchTitle];

            groupedByBranch[userBranchTitle] = {
              parentsCount: structuresDict[branchId].parentsCount || 0,
              parentsTitles: structuresDict[branchId].parentsTitles || [],
              report: [{ userId, ...getReport[userId] }]
            };
          }
        }

        for (const branchTitle of Object.keys(groupedByBranch)) {
          returnReport.push({
            groupTitle: branchTitle,
            groupParentsTitles: groupedByBranch[branchTitle].parentsTitles,
            groupParentsCount: groupedByBranch[branchTitle].parentsCount,
            groupReport: groupedByBranch[branchTitle].report
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
