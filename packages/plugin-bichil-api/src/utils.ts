import { sendCoreMessage } from './messageBroker';

export const calculateWeekendDays = (fromDate: Date, toDate: Date): number => {
  let weekendDayCount = 0;

  while (fromDate < toDate) {
    fromDate.setDate(fromDate.getDate() + 1);
    if (fromDate.getDay() === 0 || fromDate.getDay() === 6) {
      weekendDayCount++;
    }
  }

  return weekendDayCount;
};

export const customFixDate = (date?: Date) => {
  // get date, return date with 23:59:59
  const getDate = new Date(date || '').toLocaleDateString();
  const returnDate = new Date(getDate + ' 23:59:59');
  return returnDate;
};

export const paginateArray = (array, perPage = 20, page = 1) =>
  array.slice((page - 1) * perPage, page * perPage);

export const findBranches = async (subdomain: string, branchIds: string[]) => {
  const branches = await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { _id: { $in: branchIds } } },
    isRPC: true
  });

  return branches;
};

export const findUser = async (subdomain: string, userId: string) => {
  const user = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: userId
    },
    isRPC: true
  });

  return user;
};
export const findBranchUsers = async (
  subdomain: string,
  branchIds: string[]
) => {
  const branchUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { branchIds: { $in: branchIds } } },
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
    data: { query: { departmentIds: { $in: departmentIds } } },
    isRPC: true
  });
  return deptUsers;
};

export const findAllTeamMembers = async (subdomain: string) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  return users;
};

export const findAllTeamMembersWithEmpId = async (subdomain: string) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: { employeeId: { $exists: true } }
    },
    isRPC: true,
    defaultValue: []
  });

  return users;
};

export const generateCommonUserIds = async (
  subdomain: string,
  userIds: string[],
  branchIds?: string[],
  departmentIds?: string[]
) => {
  const totalUserIds: string[] = [];
  let commonUser: boolean = false;

  if (branchIds) {
    const branchUsers = await findBranchUsers(subdomain, branchIds);
    const branchUserIds = branchUsers.map(branchUser => branchUser._id);

    if (userIds) {
      commonUser = true;
      for (const userId of userIds) {
        if (branchUserIds.includes(userId)) {
          totalUserIds.push(userId);
        }
      }
    } else {
      totalUserIds.push(...branchUserIds);
    }
  }

  if (departmentIds) {
    const departmentUsers = await findDepartmentUsers(subdomain, departmentIds);

    const departmentUserIds = departmentUsers.map(
      departmentUser => departmentUser._id
    );

    if (userIds) {
      commonUser = true;
      for (const userId of userIds) {
        if (departmentUserIds.includes(userId)) {
          totalUserIds.push(userId);
        }
      }
    } else {
      totalUserIds.push(...departmentUserIds);
    }
  }

  if (!commonUser && userIds) {
    totalUserIds.push(...userIds);
  }

  return totalUserIds;
};

export const createTeamMembersObject = async (subdomain: string) => {
  const teamMembersWithEmpId = await findAllTeamMembersWithEmpId(subdomain);

  const teamMembersObject = {};

  for (const teamMember of teamMembersWithEmpId) {
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
