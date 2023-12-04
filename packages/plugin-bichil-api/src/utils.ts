import { fixDate, getSubdomain } from '@erxes/api-utils/src/core';
import { can, checkLogin } from '@erxes/api-utils/src/permissions';
import { redis } from '@erxes/api-utils/src/serviceDiscovery';
import { IUserDocument } from '@erxes/api-utils/src/types';

import * as telemetry from 'erxes-telemetry';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as xlsx from 'xlsx-populate';

import * as dayjs from 'dayjs';
import { generateModels } from './connectionResolver';
import { SALARY_FIELDS } from './constants';
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

export const findDepartments = async (
  subdomain: string,
  departmentIds: string[]
) => {
  const departments = await sendCoreMessage({
    subdomain,
    action: 'departments.find',
    data: { _id: { $in: departmentIds } },
    isRPC: true
  });

  return departments;
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
export const findSubBranches = async (subdomain: string, branchId: string) => {
  const pipeline = [
    {
      $match: { parentId: branchId } // Match the starting parent
    },
    {
      $graphLookup: {
        from: 'branches', // Collection name
        startWith: '$_id', // Assuming '_id' is the unique identifier
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        depthField: 'depth'
      }
    }
  ];

  const subBranches = await sendCoreMessage({
    subdomain,
    action: 'branches.aggregate',
    data: { pipeline },
    isRPC: true
  });

  return subBranches;
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

export const findTimeclockTeamMemberIds = async (
  models: any,
  startDate: Date,
  endDate: Date
) => {
  const timeclockUserIds = await models.Timeclocks.find({
    shiftStart: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    }
  }).distinct('userId');

  const requestsUserIds = await models.Absences.find({
    solved: true,
    status: /approved/gi,
    startTime: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    }
  }).distinct('userId');

  const scheduleIds = await models.Shifts.find({
    status: 'Approved',
    shiftStart: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    },
    shiftEnd: {
      $gte: fixDate(startDate),
      $lte: customFixDate(endDate)
    }
  }).distinct('scheduleId');

  const scheduleUserIds = await models.Schedules.find({
    _id: { $in: scheduleIds }
  }).distinct('userId');

  const allUserIds = Array.from(
    new Set([...timeclockUserIds, ...requestsUserIds, ...scheduleUserIds])
  );

  return allUserIds;
};

export const findTeamMember = (subdomain: string, userId: string[]) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: userId
    },
    isRPC: true
  });
};
export const findTeamMembers = (subdomain: string, userIds: string[]) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: { _id: { $in: userIds } }
    },
    isRPC: true,
    defaultValue: []
  });
};

const returnTotalBranchesDict = async (subdomain: any, branchIds: string[]) => {
  let dictionary: { [_id: string]: { title: string; parentId: string } } = {};

  const branches = await findBranches(subdomain, branchIds);
  const parentIds: string[] = [];

  for (const branch of branches) {
    dictionary[branch._id] = {
      title: branch.title,
      parentId: branch.parentId || null
    };
    if (branch.parentId) {
      parentIds.push(branch.parentId);
    }
  }

  if (parentIds.length) {
    const getParentsDictionary = await returnTotalBranchesDict(
      subdomain,
      parentIds
    );
    dictionary = { ...dictionary, ...getParentsDictionary };
  }

  return dictionary;
};

export const returnDepartmentsBranchesDict = async (
  subdomain: any,
  branchIds: string[],
  departmentIds: string[]
): Promise<{ [_id: string]: { title: string; parentId: string } }> => {
  let dictionary: { [_id: string]: { title: string; parentId: string } } = {};

  dictionary = await returnTotalBranchesDict(subdomain, branchIds);

  const departments = await findDepartments(subdomain, departmentIds);

  for (const department of departments) {
    dictionary[department._id] = {
      title: department.title,
      parentId: department.parentId
    };
  }

  return dictionary;
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
  const totalBranchIds = [branchIds];

  const branchIdsGivenOnly = !departmentIds && !userIds && branchIds;
  if (branchIdsGivenOnly) {
    for (const branchId of branchIds) {
      const getSubBranches = await findSubBranches(subdomain, branchId);
      totalBranchIds.push(getSubBranches.map(b => b._id));
    }

    const branchUsersIds = (await findBranchUsers(subdomain, branchIds)).map(
      b => b._id
    );

    return branchUsersIds;
  }

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

export const returnSupervisedUsers = async (
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

export const createTeamMembersObject = async (
  subdomain: any,
  userIds: string[]
) => {
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
    teamMembersObject[teamMember._id] = {
      fullName: `${teamMember.details.lastName?.charAt(0)}.${
        teamMember.details.firstName
      }`,
      employeeId: teamMember.employeeId || '-',
      position: teamMember.details.position || '-'
    };
  }

  return teamMembersObject;
};

export default async function userMiddleware(
  req: Request & { user?: any },
  _res: Response,
  next: NextFunction
) {
  const subdomain = getSubdomain(req);

  if (!req.cookies) {
    return next();
  }

  const token = req.cookies['auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const { user }: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET || '');

    const userDoc = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: user._id
      },
      isRPC: true
    });

    if (!userDoc) {
      return next();
    }

    const validatedToken = await redis.get(`user_token_${user._id}_${token}`);

    // invalid token access.
    if (!validatedToken) {
      return next();
    }

    // save user in request
    req.user = user;
    req.user.loginToken = token;
    req.user.sessionCode = req.headers.sessioncode || '';

    const currentDate = new Date();
    const machineId: string = telemetry.getMachineId();

    const lastLoginDate = new Date((await redis.get(machineId)) || '');

    if (lastLoginDate.getDay() !== currentDate.getDay()) {
      redis.set(machineId, currentDate.toJSON());

      telemetry.trackCli('last_login', { updatedAt: currentDate });
    }

    const hostname = await redis.get('hostname');

    if (!hostname) {
      redis.set('hostname', process.env.DOMAIN || 'http://localhost:3000');
    }
  } catch (e) {
    console.error(e);
  }

  return next();
}

export const handleUpload = async (
  subdomain: string,
  user: any,
  file: any,
  title: string
) => {
  const models = await generateModels(subdomain);

  const workbook = await xlsx.fromFileAsync(file.path);
  const worksheet = workbook.sheet(0);
  const usedRange = worksheet.usedRange();
  const allData: any[] = [];

  let startRow = null;

  // Loop through rows
  for (
    let i = usedRange.startCell().rowNumber();
    i <= usedRange.endCell().rowNumber();
    i++
  ) {
    if (i === 1 || i === 2) {
      continue;
    }

    const row: any[] = [];
    for (
      let j = usedRange.startCell().columnNumber();
      j <= usedRange.endCell().columnNumber();
      j++
    ) {
      const cell = worksheet.cell(i, j);
      const cellValue = cell.value();
      row.push(cellValue);

      // Check if starting row is not yet determined and the cell is non-empty
      if (
        startRow === null &&
        cellValue !== null &&
        cellValue !== undefined &&
        cellValue !== ''
      ) {
        startRow = i;
      }
    }

    if (row[0] !== null && row[0] !== undefined) {
      const employee = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          employeeId: row[0]
        },
        isRPC: true,
        defaultValue: null
      });

      if (!employee) {
        continue;
      }
    }

    if (
      row.filter(cell => cell !== null && cell !== undefined && cell !== '')
        .length === 0
    ) {
      continue;
    }

    if (
      row[0] &&
      row[0] !== null &&
      row[0] !== undefined &&
      typeof row[0] === 'string' &&
      row[0].toLowerCase().includes('нийт')
    ) {
      break;
    }

    const salaryDoc: any = {
      title,
      createdBy: user._id,
      createdAt: new Date()
    };

    for (const [index, value] of row.entries()) {
      if (value && index === 0) {
        salaryDoc.employeeId = value;
      }

      if (value && index > 3) {
        salaryDoc[SALARY_FIELDS[index - 3]] = value;
      }

      if (value === '-') {
        salaryDoc[SALARY_FIELDS[index - 3]] = 0;
      }
    }

    if (salaryDoc.employeeId) {
      allData.push(salaryDoc);
    }
  }

  if (allData.length === 0) {
    throw new Error('No valid data found');
  }

  await models.Salaries.insertMany(allData, {
    ordered: false,
    rawResult: true
  });

  // remove file
  fs.unlinkSync(file.path);

  return 'success';
};

export const checkPermission = async (
  subdomain: string,
  user: IUserDocument,
  mutationName: string
) => {
  checkLogin(user);

  const permissions = ['addSalaries'];

  const actionName = permissions.find(
    permission => permission === mutationName
  );

  if (!actionName) {
    throw new Error('Permission required');
  }

  let allowed = await can(subdomain, actionName, user);

  if (user.isOwner) {
    allowed = true;
  }

  if (!allowed) {
    throw new Error('Permission required');
  }

  return;
};

export const findUnfinishedShiftsAndUpdate = async (subdomain: any) => {
  const models = await generateModels(subdomain);

  const YESTERDAY = dayjs(new Date())
    .add(-1, 'day')
    .toDate();

  const unfinishedShifts = await models.Timeclocks.find({
    shiftActive: true,
    shiftStart: { $gte: YESTERDAY }
  });

  const bulkWriteOps: any[] = [];

  for (const unfinishedShift of unfinishedShifts) {
    const getDateTimeOfShift = unfinishedShift.shiftStart;
    const nextDay = dayjs(getDateTimeOfShift)
      .add(1, 'day')
      .format('YYYY-MM-DD');

    const midnightOfShiftDay = new Date(nextDay + ' 00:00:00');
    bulkWriteOps.push({
      updateOne: {
        filter: { _id: unfinishedShift._id },
        update: {
          $set: {
            shiftEnd: midnightOfShiftDay,
            shiftActive: false,
            shiftNotClosed: true
          }
        }
      }
    });
  }

  let result;

  if (bulkWriteOps.length) {
    result = await models.Timeclocks.bulkWrite(bulkWriteOps);
  }

  return result;
};

export const getNextNthColumnChar = (currentChar, n: number) => {
  // Convert currentChar to uppercase for consistency
  currentChar = currentChar.toUpperCase();

  // Function to convert a number to a base-26 string representation
  function toBase26String(num) {
    let result = '';
    while (num > 0) {
      let remainder = (num - 1) % 26; // Adjusting the remainder to 0-25 range
      result = String.fromCharCode(remainder + 'A'.charCodeAt(0)) + result;
      num = Math.floor((num - 1) / 26); // Update num for the next iteration
    }
    return result;
  }

  // Function to convert a base-26 string to a number
  function fromBase26String(str) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      result = result * 26 + (str.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result;
  }

  // Convert the currentChar to its numeric equivalent in the base-26 system
  const currentColumnNumber = fromBase26String(currentChar);

  // Calculate the next column number by adding n to the current column number
  const nextColumnNumber = currentColumnNumber + n;

  // Convert the nextColumnNumber back to its corresponding character representation
  const nextColumnChar = toBase26String(nextColumnNumber);

  return nextColumnChar;
};
