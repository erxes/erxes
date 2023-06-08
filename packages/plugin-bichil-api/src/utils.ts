import { getSubdomain } from '@erxes/api-utils/src/core';
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
  const teamMembers = await findAllTeamMembers(subdomain);

  const teamMembersObject = {};

  for (const teamMember of teamMembers) {
    teamMembersObject[teamMember._id] = {
      employeeId: teamMember.employeeId,
      position: teamMember.details.position,
      lastName: teamMember.details.lastName,
      firstName: teamMember.details.firstName
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
        update: { $set: { shiftEnd: midnightOfShiftDay, shiftActive: false } }
      }
    });
  }

  return models.Timeclocks.bulkWrite(bulkWriteOps);
};
