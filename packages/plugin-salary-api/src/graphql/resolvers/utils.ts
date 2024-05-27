import { IModels } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

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

export const generateFilter = async (params: any, subdomain: string) => {
  const { departmentIds, branchIds, userIds, startDate, endDate, dateFilter } =
    params;

  let filter = {};

  if (dateFilter) {
    if (!startDate && !endDate) {
      throw new Error('Please provide startDate, endDate');
    }

    filter['startDate'] = { $gte: startDate, $lte: endDate };
  }

  const totalUserIds: string[] = await generateCommonUserIds(
    subdomain,
    userIds,
    branchIds,
    departmentIds
  );

  if (totalUserIds.length) {
    filter['userId'] = { $in: totalUserIds };
  }

  return filter;
};

export const findBranchUsers = async (
  subdomain: string,
  branchIds: string[]
) => {
  const branchUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { branchIds: { $in: branchIds }, isActive: true } },
    isRPC: true
  });
  return branchUsers;
};

export const findDepartmentUsers = async (
  subdomain: string,
  departmentIds: string[]
) => {
  const deptUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { departmentIds: { $in: departmentIds }, isActive: true } },
    isRPC: true
  });
  return deptUsers;
};
