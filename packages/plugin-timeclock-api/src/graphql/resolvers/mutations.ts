import { IContext } from '../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { checkPermission } from '@erxes/api-utils/src';
import {
  IAbsence,
  ISchedule,
  IShift,
  ITimeClock,
  IAbsenceType,
  IDeviceConfig,
  IDeviceConfigDocument
} from '../../models/definitions/timeclock';
import {
  createScheduleShiftsByUserIds,
  findBranches,
  findUser,
  returnUnionOfUserIds
} from './utils';
import * as dayjs from 'dayjs';
import { fixDate } from '@erxes/api-utils/src';

interface ITimeClockEdit extends ITimeClock {
  _id: string;
  time: Date;
  longitude: number;
  latitude: number;
}

interface IAbsenceEdit extends IAbsence {
  _id: string;
  status: string;
}

interface IScheduleEdit extends ISchedule {
  _id: string;
  status: string;
}

interface IShiftEdit extends IShift {
  _id: string;
}

interface IAbsenceTypeEdit extends IAbsenceType {
  _id: string;
}

const timeclockMutations = {
  /**
   * Creates a new timeclock
   */
  async timeclockStart(
    _root,
    { userId, longitude, latitude, deviceType },
    { models, user, subdomain }: IContext
  ) {
    // convert long, lat into radians
    const longRad = (Math.PI * longitude) / 180;
    const latRad = (latitude * Math.PI) / 180;

    let insideCoordinate = false;
    let getBranchName;

    const getUserId = userId || user._id;

    const EARTH_RADIUS = 6378.14;

    const userInfo = await findUser(subdomain, getUserId);
    const branches = await findBranches(subdomain, userInfo.branchIds);

    for (const branch of branches) {
      // convert into radians
      const branchLong = (branch.coordinate.longitude * Math.PI) / 180;
      const branchLat = (branch.coordinate.latitude * Math.PI) / 180;

      const longDiff = longRad - branchLong;
      const latDiff = latRad - branchLat;

      // distance in km
      const dist =
        EARTH_RADIUS *
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(latDiff / 2), 2) +
              Math.cos(latRad) *
                Math.cos(branchLat) *
                Math.pow(Math.sin(longDiff / 2), 2)
          )
        );

      // if user's coordinate is within the radius
      if (dist * 1000 <= branch.radius) {
        insideCoordinate = true;
        getBranchName = branch.title;
      }
    }

    let timeclock;

    if (insideCoordinate) {
      timeclock = await models.Timeclocks.createTimeClock({
        shiftStart: new Date(),
        shiftActive: true,
        userId: getUserId,
        branchName: getBranchName,
        deviceType,
        inDevice: getBranchName,
        inDeviceType: deviceType
      });
    } else {
      throw new Error('User not in the coordinate');
    }

    return timeclock;
  },

  async timeclockStop(
    _root,
    { _id, userId, longitude, latitude, deviceType, ...doc }: ITimeClockEdit,
    { models, subdomain, user }: IContext
  ) {
    const timeclock = await models.Timeclocks.findOne({
      _id,
      shiftActive: true
    });
    if (!timeclock) {
      throw new Error('time clock not found');
    }

    const getUserId = userId || user._id;

    // convert long, lat into radians
    const longRad = (Math.PI * longitude) / 180;
    const latRad = (latitude * Math.PI) / 180;

    let insideCoordinate = false;

    const EARTH_RADIUS = 6378.14;

    const userInfo = await findUser(subdomain, getUserId);
    const branches = await findBranches(subdomain, userInfo.branchIds);

    let outDevice;

    for (const branch of branches) {
      // convert into radians
      const branchLong = (branch.coordinate.longitude * Math.PI) / 180;
      const branchLat = (branch.coordinate.latitude * Math.PI) / 180;

      const longDiff = longRad - branchLong;
      const latDiff = latRad - branchLat;

      // distance in km
      const dist =
        EARTH_RADIUS *
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(latDiff / 2), 2) +
              Math.cos(latRad) *
                Math.cos(branchLat) *
                Math.pow(Math.sin(longDiff / 2), 2)
          )
        );
      // if user's coordinate is within the radius
      if (dist * 1000 <= branch.radius) {
        insideCoordinate = true;
        outDevice = branch.title;
      }
    }

    let updated;

    if (insideCoordinate) {
      const getShiftStartDeviceType = (
        await models.Timeclocks.getTimeClock(_id)
      ).deviceType;

      updated = await models.Timeclocks.updateTimeClock(_id, {
        shiftEnd: new Date(),
        shiftActive: false,
        deviceType: getShiftStartDeviceType + ' x ' + deviceType,
        outDeviceType: deviceType,
        outDevice,
        userId: getUserId,
        ...doc
      });
    } else {
      throw new Error('User not in the coordinate');
    }

    return updated;
  },

  /**
   * Removes a single timeclock
   */
  timeclockRemove(_root, { _id }, { models }: IContext) {
    return models.Timeclocks.removeTimeClock(_id);
  },

  timeclockEdit(_root, { _id, ...doc }: ITimeClockEdit, { models }: IContext) {
    return models.Timeclocks.updateTimeClock(_id, doc);
  },

  timeclockCreate(_root, doc, { models }: IContext) {
    return models.Timeclocks.createTimeClock(doc);
  },

  absenceTypeAdd(_root, doc, { models }: IContext) {
    return models.AbsenceTypes.createAbsenceType(doc);
  },

  absenceTypeRemove(_root, { _id }, { models }: IContext) {
    return models.AbsenceTypes.removeAbsenceType(_id);
  },

  absenceTypeEdit(
    _root,
    { _id, ...doc }: IAbsenceTypeEdit,
    { models }: IContext
  ) {
    return models.AbsenceTypes.updateAbsenceType(_id, doc);
  },

  async submitCheckInOutRequest(
    _root,
    { checkType, userId, checkTime },
    { models, user }: IContext
  ) {
    const getUserId = userId ? userId : user._id;

    return models.Absences.createAbsence({
      reason: `${checkType} request`,
      userId: getUserId,
      startTime: checkTime,
      checkInOutRequest: true
    });
  },

  async removeAbsenceRequest(_root, { _id }, { models }: IContext) {
    return models.Absences.removeAbsence(_id);
  },

  async sendAbsenceRequest(_root, doc: IAbsence, { models }: IContext) {
    return models.Absences.createAbsence(doc);
  },

  async solveAbsenceRequest(
    _root,
    { _id, status, ...doc }: IAbsenceEdit,
    { models }: IContext
  ) {
    const shiftRequest = await models.Absences.getAbsence(_id);
    let updated = models.Absences.updateAbsence(_id, {
      status,
      solved: true,
      ...doc
    });

    const findUserSchedules = await models.Schedules.find({
      userId: shiftRequest.userId
    });

    const findUserScheduleShifts = await models.Shifts.find({
      scheduleId: {
        $in: findUserSchedules.map(schedule => schedule._id)
      },
      shiftStart: {
        $gte: fixDate(shiftRequest.startTime)
      }
    });

    if (!shiftRequest.checkInOutRequest) {
      const findAbsenceType = await models.AbsenceTypes.getAbsenceType(
        shiftRequest.absenceTypeId || ''
      );

      // if request is shift request
      if (findAbsenceType && findAbsenceType.shiftRequest) {
        updated = models.Absences.updateAbsence(_id, {
          status: `Shift request / ${status}`,
          ...doc
        });

        // if shift request is approved
        if (status === 'Approved') {
          if (findAbsenceType.requestTimeType === 'by day') {
            const requestDates = shiftRequest.requestDates || [];

            const schedule = await models.Schedules.createSchedule({
              userId: shiftRequest.userId,
              solved: true,
              status: 'Approved',
              createdByRequest: true
            });

            const scheduleShiftsWriteOps: any[] = [];
            const scheduleShiftUpdateOps: any[] = [];
            const timeclockBulkWriteOps: any[] = [];

            for (const requestDate of requestDates) {
              const requestStartTime = new Date(requestDate + ' 09:00:00');
              const requestEndTime = dayjs(requestStartTime)
                .add(findAbsenceType.requestHoursPerDay, 'hour')
                .toDate();

              timeclockBulkWriteOps.push({
                userId: shiftRequest.userId,
                shiftStart: requestStartTime,
                shiftEnd: requestEndTime,
                shiftActive: false,
                deviceType: 'Shift request'
              });

              const findOverrideShift = findUserScheduleShifts.find(
                shift =>
                  dayjs(new Date(shift.shiftStart || '')).format(
                    'MM/DD/YYYY'
                  ) === requestDate
              );
              if (findOverrideShift) {
                scheduleShiftUpdateOps.push({
                  updateOne: {
                    filter: {
                      _id: findOverrideShift._id
                    },
                    update: {
                      $set: {
                        scheduleId: schedule._id,
                        shiftStart: requestStartTime,
                        shiftEnd: requestEndTime,
                        solved: true,
                        status: 'Approved'
                      }
                    }
                  }
                });

                continue;
              }

              scheduleShiftsWriteOps.push({
                insertOne: {
                  document: {
                    scheduleId: schedule._id,
                    shiftStart: requestStartTime,
                    shiftEnd: requestEndTime,
                    solved: true,
                    status: 'Approved'
                  }
                }
              });
            }

            if (scheduleShiftsWriteOps.length) {
              await models.Shifts.bulkWrite(scheduleShiftsWriteOps);
            }
            if (scheduleShiftUpdateOps.length) {
              await models.Shifts.bulkWrite(scheduleShiftUpdateOps);
            }
            await models.Timeclocks.insertMany(timeclockBulkWriteOps);
            return;
          }

          //  shift request - by time
          if (shiftRequest.userId) {
            const newSchedule = await models.Schedules.createSchedule({
              userId: shiftRequest.userId,
              solved: true,
              status: 'Approved',
              createdByRequest: true
            });

            await models.Shifts.createShift({
              scheduleId: newSchedule._id,
              shiftStart: shiftRequest.startTime,
              shiftEnd: shiftRequest.endTime,
              solved: true,
              status: 'Approved'
            });

            await models.Timeclocks.createTimeClock({
              userId: shiftRequest.userId,
              shiftStart: shiftRequest.startTime,
              shiftEnd: shiftRequest.endTime,
              shiftActive: false,
              deviceType: 'Shift request'
            });
          }
        }
      }

      return updated;
    }

    // if request is check in/out request
    return models.Absences.updateAbsence(_id, {
      status: `${shiftRequest.reason} / ${status}`,
      solved: true,
      ...doc
    });
  },

  async solveScheduleRequest(
    _root,
    { _id, status, ...doc }: IScheduleEdit,
    { models }: IContext
  ) {
    const updated = models.Schedules.updateSchedule(_id, {
      status,
      solved: true,
      ...doc
    });

    await models.Shifts.updateMany(
      { scheduleId: _id, solved: false },
      { $set: { status, solved: true } }
    );

    return updated;
  },

  async solveShiftRequest(
    _root,
    { _id, status, ...doc }: IShiftEdit,
    { models }: IContext
  ) {
    const shift = await models.Shifts.getShift(_id);
    const updated = await models.Shifts.updateShift(_id, {
      status,
      solved: true,
      ...doc
    });

    // check if all shifts of a schedule solved
    let otherShiftsSolved = true;
    const schedule = await models.Shifts.find({ scheduleId: shift.scheduleId });

    for (const shiftOfSchedule of schedule) {
      if (shiftOfSchedule.solved === false) {
        otherShiftsSolved = false;
        break;
      }
    }

    if (otherShiftsSolved) {
      await models.Schedules.updateOne(
        { _id: shift.scheduleId },
        { $set: { solved: true, status: 'Solved' } }
      );
    }

    return updated;
  },

  async sendScheduleRequest(_root, { shifts, ...doc }, { models }: IContext) {
    const schedule = await models.Schedules.createSchedule(doc);

    shifts.map(shift => {
      models.Shifts.createShift({
        scheduleId: schedule._id,
        shiftStart: shift.shiftStart,
        shiftEnd: shift.shiftEnd,
        scheduleConfigId: shift.scheduleConfigId,
        lunchBreakInMins: shift.lunchBreakInMins
      });
    });

    return schedule;
  },
  async checkDuplicateScheduleShifts(
    _root,
    { branchIds, departmentIds, userIds, shifts, status },
    { models, subdomain }: IContext
  ) {
    const scheduledUserIds = await returnUnionOfUserIds(
      branchIds,
      departmentIds,
      userIds,
      subdomain
    );

    const filterApprovedSchedules = status
      ? { status, solved: true }
      : { status: { $ne: 'Rejected' } };

    const totalSchedules = await models.Schedules.find({
      userId: { $in: scheduledUserIds },
      ...filterApprovedSchedules
    });

    if (!totalSchedules.length) {
      return [];
    }

    const totalScheduleIds = totalSchedules.map(schedule => schedule._id);

    const findManyOps: any[] = [];

    for (const shift of shifts) {
      const shiftDuplicateCases = [
        {
          shiftStart: { $gte: shift.shiftStart },
          shiftEnd: { $lte: shift.shiftEnd }
        },
        {
          shiftEnd: { $gte: shift.shiftStart, $lte: shift.shiftEnd }
        },
        { shiftStart: { $gte: shift.shiftStart, $lte: shift.shiftEnd } },
        {
          shiftStart: {
            $lte: shift.shiftEnd
          },
          shiftEnd: {
            $gte: shift.shiftStart
          }
        }
      ];

      findManyOps.push(...shiftDuplicateCases);
    }

    const duplicateShifts = await models.Shifts.find({
      $and: [
        { scheduleId: { $in: totalScheduleIds } },
        {
          $or: findManyOps
        }
      ]
    });

    const duplicateScheduleIds = duplicateShifts.map(shift => shift.scheduleId);
    const duplicateSchedules = totalSchedules.filter(schedule =>
      duplicateScheduleIds.includes(schedule._id)
    );

    for (const schedule of duplicateSchedules) {
      schedule.shiftIds = duplicateShifts.map(shift => shift._id);
    }

    return duplicateSchedules;
  },
  async submitSchedule(
    _root,
    { branchIds, departmentIds, userIds, shifts, totalBreakInMins },
    { subdomain, models }: IContext
  ) {
    return createScheduleShiftsByUserIds(
      await returnUnionOfUserIds(branchIds, departmentIds, userIds, subdomain),
      shifts,
      models,
      totalBreakInMins
    );
  },

  scheduleRemove(_root, { _id }, { models }: IContext) {
    models.Schedules.removeSchedule(_id);
    models.Shifts.remove({ scheduleId: _id });
    return;
  },
  async scheduleShiftRemove(_root, { _id }, { models }: IContext) {
    const getShift = await models.Shifts.getShift(_id);
    const getShiftsCount = await models.Shifts.count({
      scheduleId: getShift.scheduleId
    });
    // if it's the only one shift in schedule, remove schedule
    if (getShiftsCount === 1 && getShift.scheduleId) {
      await models.Schedules.removeSchedule(getShift.scheduleId);
    }

    return models.Shifts.removeShift(_id);
  },
  payDateAdd(_root, { dateNums }, { models }: IContext) {
    return models.PayDates.createPayDate({ payDates: dateNums });
  },

  payDateEdit(_root, { _id, dateNums }, { models }: IContext) {
    return models.PayDates.updatePayDate(_id, { payDates: dateNums });
  },

  payDateRemove(_root, { _id }, { models }: IContext) {
    return models.PayDates.removePayDate(_id);
  },

  holidayAdd(_root, { name, startDate, endDate }, { models }: IContext) {
    return models.Absences.createAbsence({
      holidayName: name,
      startTime: startDate,
      endTime: endDate,
      status: 'Holiday',
      reason: 'Holiday',
      solved: true
    });
  },

  holidayEdit(
    _root,
    { _id, name, startDate, endDate, doc },
    { models }: IContext
  ) {
    return models.Absences.updateAbsence(_id, {
      holidayName: name,
      startTime: startDate,
      endTime: endDate,
      status: 'Holiday',
      ...doc
    });
  },

  holidayRemove(_root, { _id }, { models }: IContext) {
    return models.Absences.removeAbsence(_id);
  },

  async scheduleConfigAdd(
    _root,
    {
      scheduleName,
      lunchBreakInMins,
      scheduleConfig,
      configShiftStart,
      configShiftEnd
    },
    { models }: IContext
  ) {
    const newScheduleConfig = await models.ScheduleConfigs.createScheduleConfig(
      {
        scheduleName,
        lunchBreakInMins,
        shiftStart: configShiftStart,
        shiftEnd: configShiftEnd
      }
    );

    const timeFormat = 'HH:mm';

    scheduleConfig.forEach(async scheduleShift => {
      await models.Shifts.createShift({
        scheduleConfigId: newScheduleConfig._id,
        configShiftStart: dayjs(scheduleShift.shiftStart).format(timeFormat),
        configShiftEnd: dayjs(scheduleShift.shiftEnd).format(timeFormat),
        configName: scheduleShift.configName,
        overnightShift: scheduleShift.overnightShift
      });
    });

    return newScheduleConfig;
  },

  async scheduleConfigRemove(_root, { _id }, { models }: IContext) {
    const scheduleConfig = await models.ScheduleConfigs.getScheduleConfig(_id);

    await models.ScheduleConfigs.deleteMany({
      scheduleConfigId: scheduleConfig._id
    });

    return models.ScheduleConfigs.removeScheduleConfig(_id);
  },

  async scheduleConfigEdit(
    _root,
    {
      _id,
      scheduleName,
      lunchBreakInMins,
      scheduleConfig,
      configShiftStart,
      configShiftEnd,
      doc
    },
    { models }: IContext
  ) {
    const newScheduleConfig = await models.ScheduleConfigs.updateScheduleConfig(
      _id,
      {
        scheduleName,
        lunchBreakInMins,
        shiftEnd: configShiftEnd,
        shiftStart: configShiftStart,
        ...doc
      }
    );

    const timeFormat = 'HH:mm';

    scheduleConfig.forEach(async scheduleShift => {
      const selector = {
        $and: [
          { scheduleConfigId: _id },
          { configName: scheduleShift.configName }
        ]
      };

      const updated = await models.Shifts.updateOne(selector, {
        configShiftStart: dayjs(scheduleShift.shiftStart).format(timeFormat),
        configShiftEnd: dayjs(scheduleShift.shiftEnd).format(timeFormat),
        overnightShift: scheduleShift.overnightShift,
        ...scheduleShift
      });
    });

    return newScheduleConfig;
  },

  checkReport(_root, doc, { models, user }: IContext) {
    const getUserId = doc.userId || user._id;
    return models.ReportChecks.createReportCheck({
      userId: getUserId,
      ...doc
    });
  },

  checkSchedule(_root, { scheduleId }, { models }: IContext) {
    return models.Schedules.updateSchedule(scheduleId, {
      scheduleChecked: true
    });
  }
};

moduleRequireLogin(timeclockMutations);

// extract from mssql
checkPermission(
  timeclockMutations,
  'extractAllDataFromMsSQL',
  'manageTimeclocks'
);
checkPermission(
  timeclockMutations,
  'extractTimeLogsFromMsSQL',
  'manageTimeclocks'
);

checkPermission(timeclockMutations, 'solveScheduleRequest', 'manageTimeclocks');
checkPermission(timeclockMutations, 'scheduleRemove', 'manageTimeclocks');
checkPermission(timeclockMutations, 'submitSchedule', 'manageTimeclocks');

checkPermission(timeclockMutations, 'solveAbsenceRequest', 'manageTimeclocks');
checkPermission(timeclockMutations, 'removeAbsenceRequest', 'manageTimeclocks');

checkPermission(timeclockMutations, 'timeclockRemove', 'manageTimeclocks');
checkPermission(timeclockMutations, 'timeclockEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'timeclockCreate', 'manageTimeclocks');

checkPermission(
  timeclockMutations,
  'createTimeClockFromLog',
  'manageTimeclocks'
);

// configs
checkPermission(timeclockMutations, 'scheduleConfigAdd', 'manageTimeclocks');
checkPermission(timeclockMutations, 'scheduleConfigEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'scheduleConfigRemove', 'manageTimeclocks');

checkPermission(timeclockMutations, 'absenceTypeAdd', 'manageTimeclocks');
checkPermission(timeclockMutations, 'absenceTypeEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'absenceTypeRemove', 'manageTimeclocks');

checkPermission(timeclockMutations, 'payDateAdd', 'manageTimeclocks');
checkPermission(timeclockMutations, 'payDateEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'payDateRemove', 'manageTimeclocks');

checkPermission(timeclockMutations, 'holidayAdd', 'manageTimeclocks');
checkPermission(timeclockMutations, 'holidayEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'holidayRemove', 'manageTimeclocks');

checkPermission(timeclockMutations, 'deviceConfigAdd', 'manageTimeclocks');
checkPermission(timeclockMutations, 'deviceConfigEdit', 'manageTimeclocks');
checkPermission(timeclockMutations, 'deviceConfigRemove', 'manageTimeclocks');

export default timeclockMutations;
