import { generateModels, IModels } from './connectionResolver';
import { sendCoreMessage, sendFormsMessage } from './messageBroker';
import { ITimeClock, IUserReport } from './models/definitions/timeclock';
import * as dayjs from 'dayjs';
import { fixDate, getEnv } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { Sequelize, QueryTypes } from 'sequelize';
import { findBranch, findDepartment } from './graphql/resolvers/utils';

const findUserByEmployeeId = async (subdomain: string, empId: number) => {
  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: {
        code: 'employeeId'
      }
    },
    isRPC: true
  });

  let user: IUserDocument;

  if (field) {
    user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        customFieldsData: { $elemMatch: { field: field._id, value: empId } }
      },
      isRPC: true
    });

    return user;
  } else {
    return null;
  }
};

const connectAndQueryFromMySql = async (subdomain: string, query: string) => {
  const MYSQL_HOST = getEnv({ name: 'MYSQL_HOST' });
  const MYSQL_DB = getEnv({ name: 'MYSQL_DB' });
  const MYSQL_USERNAME = getEnv({ name: 'MYSQL_USERNAME' });
  const MYSQL_PASSWORD = getEnv({ name: 'MYSQL_PASSWORD' });

  const sequelize = new Sequelize(MYSQL_DB, MYSQL_USERNAME, MYSQL_PASSWORD, {
    host: MYSQL_HOST,
    port: 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        useUTC: false,
        cryptoCredentialsDetails: {
          minVersion: 'TLSv1'
        }
      }
    }
  });
  let returnData;

  sequelize
    .authenticate()
    .then(async () => {
      console.log('Connected to MSSQL');
    })
    .catch(err => {
      console.error(err);
      return err;
    });
  try {
    const queryData = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    returnData = await importDataAndCreateTimeclock(subdomain, queryData);
  } catch (err) {
    console.error(err);
    return err;
  }

  return returnData;
};

const importDataAndCreateTimeclock = async (
  subdomain: string,
  queryData: any
) => {
  const returnData: ITimeClock[] = [];
  const models: IModels = await generateModels(subdomain);
  let currentEmpId = -9999999999;
  let currentEmpData: any;

  for (const queryRow of queryData) {
    const empId = queryRow.ID;
    if (empId === currentEmpId) {
      continue;
    } else {
      currentEmpId = empId;

      // if given employee id is number, extract all employee timeclock data
      const empIdNumber = parseInt(empId, 10);
      if (empIdNumber) {
        currentEmpData = queryData.filter(row => row.ID === currentEmpId);

        returnData.push(
          ...(await createUserTimeclock(
            subdomain,
            models,
            empIdNumber,
            queryRow.employeeName,
            currentEmpData
          ))
        );
      }
    }
  }

  await models.Timeclocks.insertMany(returnData);

  return models.Timeclocks.find();
};

const createUserTimeclock = async (
  subdomain: string,
  models: IModels,
  empId: number,
  empName: string,
  empData: any
) => {
  const returnUserData: ITimeClock[] = [];
  const user = await findUserByEmployeeId(subdomain, empId);

  // find if there's any unfinished shift from previous timeclock data
  const unfinishedShifts = await models?.Timeclocks.find({
    shiftActive: true,
    employeeId: empId
  });

  for (const unfinishedShift of unfinishedShifts) {
    const getShiftStart = dayjs(unfinishedShift.shiftStart);

    // find the potential shift end, which must be 30 mins later and within 16 hrs from shift start
    const getShiftIdx = empData.findIndex(
      row =>
        dayjs(row.authDateTime) > getShiftStart.add(30, 'minute') &&
        dayjs(row.authDateTime) < getShiftStart.add(16, 'hour')
    );

    if (getShiftIdx !== -1) {
      const potentialShiftEnd = empData[getShiftIdx].authDateTime;

      // get reverse array
      const reverseEmpData = empData.slice().reverse();

      // find the latest time for shift end
      const findLatestShiftEndIdx = reverseEmpData.findIndex(
        row =>
          dayjs(row.authDateTime) < dayjs(potentialShiftEnd).add(30, 'minute')
      );

      const latestShiftIdx = empData.length - 1 - findLatestShiftEndIdx;

      await models.Timeclocks.updateTimeClock(unfinishedShift._id, {
        userId: user?._id,
        employeeId: empId,
        shiftStart: unfinishedShift.shiftStart,
        shiftEnd: dayjs(empData[latestShiftIdx].authDateTime).toDate(),
        shiftActive: false
      });

      // remove those shift(s) from emp Data
      empData.splice(getShiftIdx, latestShiftIdx - getShiftIdx + 1);
    }
  }

  // filter emp data, get First In, Last Out time
  for (let i = 0; i < empData.length; i++) {
    const currShiftStart = empData[i].authDateTime;
    // consider shift end as 10 mins after shift start
    const getShiftEndIdx = empData.findIndex(
      row =>
        dayjs(row.authDateTime) > dayjs(currShiftStart).add(10, 'minute') &&
        dayjs(row.authDateTime) <= dayjs(currShiftStart).add(16, 'hour')
    );

    // if no shift end is found, shift is stilll active
    if (getShiftEndIdx === -1) {
      const newTimeclock = {
        shiftStart: dayjs(currShiftStart).toDate(),
        userId: user?._id,
        deviceName: empData[i].deviceName,
        employeeUserName: empName || undefined,
        employeeId: empId,
        shiftActive: true,
        deviceType: 'faceTerminal'
      };

      if (!(await checkTimeClockAlreadyExists(newTimeclock, models))) {
        returnUserData.push(newTimeclock);
      }
      continue;
    }

    let currShiftEnd = empData[getShiftEndIdx].authDateTime;

    // get reverse array
    const reverseEmpData = empData.slice().reverse();

    // find the latest time for shift end
    const findLatestShiftEndIdx = reverseEmpData.findIndex(
      row => dayjs(row.authDateTime) < dayjs(currShiftEnd).add(30, 'minute')
    );

    i = empData.length - 1 - findLatestShiftEndIdx;
    currShiftEnd = empData[i].authDateTime;

    const newTimeclockData = {
      shiftStart: dayjs(currShiftStart).toDate(),
      shiftEnd: dayjs(currShiftEnd).toDate(),
      userId: user?._id,
      deviceName: empData[getShiftEndIdx].deviceName || undefined,
      employeeUserName: empName || undefined,
      employeeId: empId,
      shiftActive: false,
      deviceType: 'faceTerminal'
    };

    if (!(await checkTimeClockAlreadyExists(newTimeclockData, models))) {
      returnUserData.push(newTimeclockData);
    }
  }

  return returnUserData;
};

const checkTimeClockAlreadyExists = async (
  userData: ITimeClock,
  models: IModels
) => {
  let alreadyExists = false;

  // check if time log already exists in mongodb
  const existingTimeclocks = await models.Timeclocks.find({
    $or: [
      {
        userId: userData.userId
      },
      {
        employeeUserName: userData.employeeUserName
      },
      { employeeId: userData.employeeId }
    ]
  });

  // find duplicates and not include them in new timeclock data
  const findExistingTimeclock = existingTimeclocks.find(
    existingShift =>
      existingShift.shiftStart.getTime() === userData.shiftStart?.getTime() ||
      existingShift.shiftEnd?.getTime() === userData.shiftEnd?.getTime()
  );

  if (findExistingTimeclock) {
    alreadyExists = true;
  }

  return alreadyExists;
};
const generateFilter = async (params, subdomain, type) => {
  const branchIds = params.branchIds;
  const departmentIds = params.departmentIds;
  const userIds = params.userIds;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const totalUserIds: string[] = [];
  let commonUser: boolean = false;
  let dateGiven: boolean = false;

  let returnFilter = {};

  if (branchIds) {
    for (const branchId of branchIds) {
      const branch = await findBranch(subdomain, branchId);
      if (userIds) {
        commonUser = true;
        for (const userId of userIds) {
          if (branch.userIds.includes(userId)) {
            totalUserIds.push(userId);
          }
        }
      } else {
        totalUserIds.push(...branch.userIds);
      }
    }
  }
  if (departmentIds) {
    for (const deptId of departmentIds) {
      const department = await findDepartment(subdomain, deptId);
      if (userIds) {
        commonUser = true;
        for (const userId of userIds) {
          if (department.userIds.includes(userId)) {
            totalUserIds.push(userId);
          }
        }
      } else {
        totalUserIds.push(...department.userIds);
      }
    }
  }

  if (!commonUser && userIds) {
    totalUserIds.push(...userIds);
  }

  const timeFields =
    type === 'schedule'
      ? []
      : type === 'timeclock'
      ? [
          {
            shiftStart:
              startDate && endDate
                ? {
                    $gte: fixDate(startDate),
                    $lte: fixDate(endDate)
                  }
                : startDate
                ? {
                    $gte: fixDate(startDate)
                  }
                : { $lte: fixDate(endDate) }
          },
          {
            shiftEnd:
              startDate && endDate
                ? {
                    $gte: fixDate(startDate),
                    $lte: fixDate(endDate)
                  }
                : startDate
                ? {
                    $gte: fixDate(startDate)
                  }
                : { $lte: fixDate(endDate) }
          }
        ]
      : [
          {
            startTime:
              startDate && endDate
                ? {
                    $gte: fixDate(startDate),
                    $lte: fixDate(endDate)
                  }
                : startDate
                ? {
                    $gte: fixDate(startDate)
                  }
                : { $lte: fixDate(endDate) }
          },
          {
            endTime:
              startDate && endDate
                ? {
                    $gte: fixDate(startDate),
                    $lte: fixDate(endDate)
                  }
                : startDate
                ? {
                    $gte: fixDate(startDate)
                  }
                : { $lte: fixDate(endDate) }
          }
        ];

  if (startDate || endDate) {
    dateGiven = true;
  }

  if (totalUserIds.length > 0) {
    if (dateGiven) {
      returnFilter = {
        $and: [...timeFields, { userId: { $in: [...totalUserIds] } }]
      };
    } else {
      returnFilter = { userId: { $in: [...totalUserIds] } };
    }
  }

  if (
    !departmentIds &&
    !branchIds &&
    !userIds &&
    dateGiven &&
    type !== 'schedule'
  ) {
    returnFilter = { $or: timeFields };
  }

  // if no param is given, return empty filter
  return returnFilter;
};

export { connectAndQueryFromMySql, generateFilter };
