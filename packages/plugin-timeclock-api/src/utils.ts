import { generateModels, IModels } from './connectionResolver';
import { sendCoreMessage, sendFormsMessage } from './messageBroker';
import { ITimeClock, IUserReport } from './models/definitions/timeclock';
import * as mysql from 'mysql2';
import * as dayjs from 'dayjs';
import { getEnv } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';

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
  const MYSQL_HOST = getEnv({ name: 'MYSQL_HOST ' });
  const MYSQL_DB = getEnv({ name: 'MYSQL_DB' });
  const MYSQL_USERNAME = getEnv({ name: 'MYSQL_USERNAME' });
  const MYSQL_PASSWORD = getEnv({ name: 'MYSQL_PASSWORD' });

  // create the connection to mySQL database
  const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB
  });

  connection.connect(err => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });

  let returnData;
  connection.query(query, async (error, results) => {
    if (error) {
      throw new Error(`error: ${error}`);
    }

    returnData = await importDataAndCreateTimeclock(subdomain, results);
  });

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
    $or: [{ userId: user && user._id }, { employeeId: empId }]
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
        shiftStart: unfinishedShift.shiftStart,
        shiftEnd: new Date(empData[latestShiftIdx].authDateTime),
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
        dayjs(row.authDateTime) < dayjs(currShiftStart).add(16, 'hour')
    );

    // if no shift end is found, shift is stilll active
    if (getShiftEndIdx === -1) {
      const newTimeclock = {
        shiftStart: new Date(currShiftStart),
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
      shiftStart: new Date(currShiftStart),
      shiftEnd: new Date(currShiftEnd),
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

export { connectAndQueryFromMySql };
