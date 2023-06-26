import { IModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
import { fixDate } from '@erxes/api-utils/src';

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';
import {
  findBranches,
  findBranchUsers,
  findDepartments,
  findDepartmentUsers
} from './graphql/resolvers/utils';
import { IUserDocument } from '@erxes/api-utils/src/types';

const customFixDate = (date?: Date) => {
  // get date, return date with 23:59:59
  const getDate = new Date(date || '').toLocaleDateString();
  const returnDate = new Date(getDate + ' 23:59:59');
  return returnDate;
};

const findAllTeamMembersWithEmpId = (subdomain: string) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: { employeeId: { $exists: true } }
    },
    isRPC: true,
    defaultValue: []
  });
};

const findTeamMembers = (subdomain: string, userIds: string[]) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: { employeeId: { $exists: true }, _id: { $in: userIds } }
    },
    isRPC: true,
    defaultValue: []
  });
};

const findTeamMember = (subdomain: string, userId: string[]) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: userId
    },
    isRPC: true
  });
};

const createTeamMembersObject = async (subdomain: any, userIds: string[]) => {
  const teamMembersObject = {};

  const teamMembers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: { _id: { $in: userIds } }
    },
    isRPC: true,
    defaultValue: []
  });

  for (const teamMember of teamMembers) {
    if (!teamMember.employeeId) {
      continue;
    }

    teamMembersObject[teamMember._id] = {
      employeeId: teamMember.employeeId,
      lastName: teamMember.details.lastName,
      firstName: teamMember.details.firstName,
      position: teamMember.details.position
    };
  }

  return teamMembersObject;
};

const returnDepartmentsBranchesDict = async (
  subdomain: any,
  branchIds: string[],
  departmentIds: string[]
): Promise<{ [_id: string]: string }> => {
  const dictionary: { [_id: string]: string } = {};

  const branches = await findBranches(subdomain, branchIds);
  const departments = await findDepartments(subdomain, departmentIds);

  for (const branch of branches) {
    dictionary[branch._id] = branch.title;
  }

  for (const department of departments) {
    dictionary[department._id] = department.title;
  }

  return dictionary;
};

const returnSupervisedUsers = async (
  currentUser: IUserDocument,
  subdomain: string
): Promise<IUserDocument[]> => {
  const supervisedDepartmenIds = (
    await sendCoreMessage({
      subdomain,
      action: `departments.find`,
      data: {
        supervisorId: currentUser._id
      },
      isRPC: true,
      defaultValue: []
    })
  ).map(dept => dept._id);

  const supervisedBranchIds = (
    await sendCoreMessage({
      subdomain,
      action: `branches.find`,
      data: {
        query: {
          supervisorId: currentUser._id
        }
      },
      isRPC: true,
      defaultValue: []
    })
  ).map(branch => branch._id);

  const findTotalSupervisedUsers: IUserDocument[] = [];

  findTotalSupervisedUsers.push(
    ...(await findDepartmentUsers(subdomain, supervisedDepartmenIds))
  );

  findTotalSupervisedUsers.push(
    ...(await findBranchUsers(subdomain, supervisedBranchIds)),
    currentUser
  );

  return findTotalSupervisedUsers;
};

const generateFilter = async (
  params: any,
  subdomain: string,
  models: IModels,
  type: string,
  user: IUserDocument
) => {
  const {
    departmentIds,
    branchIds,
    userIds,
    startDate,
    endDate,
    scheduleStatus,
    isCurrentUserAdmin
  } = params;

  let scheduleFilter = {};
  let userIdsGiven: boolean = false;

  //  if schedule status is not set, return empty list
  if (type === 'schedule' && !scheduleStatus) {
    return [{}, false];
  }

  if (branchIds || departmentIds || userIds) {
    userIdsGiven = true;
  }

  const totalUserIds: string[] = await generateCommonUserIds(
    subdomain,
    userIds,
    branchIds,
    departmentIds
  );

  // user Ids given but no common user was found
  if (userIdsGiven && !totalUserIds.length) {
    return [{}, false];
  }

  // if current user is not admin, return supervised users
  const totalSupervisedUsers = !isCurrentUserAdmin
    ? await returnSupervisedUsers(user, subdomain)
    : [];

  if (!isCurrentUserAdmin) {
    scheduleFilter = {
      userId: { $in: totalSupervisedUsers.map(usr => usr._id) }
    };
  }

  if (scheduleStatus) {
    if (scheduleStatus.toLowerCase() === 'pending') {
      scheduleFilter = { ...scheduleFilter, solved: false };
    }

    if (
      scheduleStatus.toLowerCase() === 'approved' ||
      scheduleStatus.toLowerCase() === 'rejected'
    ) {
      scheduleFilter = { ...scheduleFilter, status: scheduleStatus };
    }
  }
  const scheduleShiftSelector = {
    shiftStart: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    },
    shiftEnd: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    }
  };

  // check non empty schedule shifts for schedulesMainQuery
  const scheduleShifts = await models.Shifts.find(scheduleShiftSelector);

  const scheduleIds = new Set(
    scheduleShifts.map(scheduleShift => scheduleShift.scheduleId)
  );

  let returnFilter: any = { _id: { $in: [...scheduleIds] }, ...scheduleFilter };

  const timeFields = returnTimeFieldsFilter(type, params);

  if (totalUserIds.length > 0) {
    if (type === 'schedule') {
      returnFilter = { userId: { $in: [...totalUserIds] }, ...returnFilter };
    } else {
      returnFilter = {
        $and: [{ userId: { $in: [...totalUserIds] } }, { $or: timeFields }]
      };
    }
  }

  if (!userIdsGiven && type !== 'schedule') {
    returnFilter = {};
    if (!isCurrentUserAdmin) {
      returnFilter = {
        userId: { $in: totalSupervisedUsers.map(usr => usr._id) }
      };
    }
    returnFilter = {
      ...returnFilter,
      $or: timeFields
    };
  }

  return [returnFilter, true];
};

const returnTimeFieldsFilter = (type: string, queryParams: any) => {
  const startDate = queryParams.startDate;
  const endDate = queryParams.endDate;

  switch (type) {
    case 'schedule':
      return [];
    case 'timeclock':
      return [
        {
          shiftStart:
            startDate && endDate
              ? {
                  $gte: fixDate(startDate),
                  $lte: customFixDate(endDate)
                }
              : startDate
              ? {
                  $gte: fixDate(startDate)
                }
              : { $lte: customFixDate(endDate) }
        },
        {
          shiftEnd:
            startDate && endDate
              ? {
                  $gte: fixDate(startDate),
                  $lte: customFixDate(endDate)
                }
              : startDate
              ? {
                  $gte: fixDate(startDate)
                }
              : { $lte: customFixDate(endDate) }
        }
      ];
    case 'absence':
      return [
        {
          startTime:
            startDate && endDate
              ? {
                  $gte: fixDate(startDate),
                  $lte: customFixDate(endDate)
                }
              : startDate
              ? {
                  $gte: fixDate(startDate)
                }
              : { $lte: customFixDate(endDate) }
        },
        {
          endTime:
            startDate && endDate
              ? {
                  $gte: fixDate(startDate),
                  $lte: customFixDate(endDate)
                }
              : startDate
              ? {
                  $gte: fixDate(startDate)
                }
              : { $lte: customFixDate(endDate) }
        }
      ];
    case 'timelog':
      return [
        {
          timelog:
            startDate && endDate
              ? {
                  $gte: fixDate(startDate),
                  $lte: customFixDate(endDate)
                }
              : startDate
              ? {
                  $gte: fixDate(startDate)
                }
              : { $lte: customFixDate(endDate) }
        }
      ];
  }
};

const generateCommonUserIds = async (
  subdomain: string,
  userIds: string[],
  branchIds?: string[],
  departmentIds?: string[]
) => {
  const totalUserIds: string[] = [];

  const branchUsers =
    branchIds && (await findBranchUsers(subdomain, branchIds));

  const departmentUsers =
    departmentIds && (await findDepartmentUsers(subdomain, departmentIds));

  const branchUserIds =
    branchUsers && branchUsers.map(branchUser => branchUser._id);

  const departmentUserIds =
    departmentUsers &&
    departmentUsers.map(departmentUser => departmentUser._id);

  // if both branch and department are given find common users between them
  if (branchIds && departmentIds) {
    const intersectionOfUserIds = branchUserIds.filter(branchUserId =>
      departmentUserIds.includes(branchUserId)
    );

    return intersectionOfUserIds;
  }

  // if no branch/department was given return userIds
  if (userIds && !branchUserIds && !departmentUserIds) {
    return userIds;
  }

  // if both branch, userIds were given
  if (branchUserIds) {
    if (!userIds) {
      return branchUserIds;
    }

    for (const userId of userIds) {
      if (branchUserIds.includes(userId)) {
        totalUserIds.push(userId);
      }
    }
  }

  // if both department, userIds were given
  if (departmentUserIds) {
    if (!userIds) {
      return departmentUserIds;
    }

    for (const userId of userIds) {
      if (departmentUserIds.includes(userId)) {
        totalUserIds.push(userId);
      }
    }
  }

  return totalUserIds;
};

export {
  generateFilter,
  generateCommonUserIds,
  findAllTeamMembersWithEmpId,
  createTeamMembersObject,
  customFixDate,
  returnSupervisedUsers,
  findTeamMembers,
  findTeamMember,
  returnDepartmentsBranchesDict
};
