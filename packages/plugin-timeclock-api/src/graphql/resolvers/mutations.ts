import { IContext } from '../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import {
  IAbsence,
  ISchedule,
  IShift,
  ITimeClock,
  IAbsenceType
} from '../../models/definitions/timeclock';
import {
  createScheduleShiftsByUserIds,
  findBranch,
  findBranches,
  findDepartment
} from './utils';
import dayjs = require('dayjs');
import { connectAndQueryFromMySql } from '../../utils';

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
    const EARTH_RADIUS = 6378.14;
    const branches = await findBranches(subdomain, user._id);

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
        userId: userId ? `${userId}` : user._id,
        branchName: getBranchName,
        deviceType: `${deviceType}`
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
    // convert long, lat into radians
    const longRad = (Math.PI * longitude) / 180;
    const latRad = (latitude * Math.PI) / 180;

    let insideCoordinate = false;

    const EARTH_RADIUS = 6378.14;
    const branches = await findBranches(subdomain, user._id);

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
        deviceType: getShiftStartDeviceType + ' + ' + deviceType,
        ...doc
      });
    } else {
      throw new Error('User not in the coordinate');
    }

    return updated;
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

  /**
   * Removes a single timeclock
   */
  async timeclockRemove(_root, { _id }, { models }: IContext) {
    return models.Timeclocks.removeTimeClock(_id);
  },

  async sendAbsenceRequest(
    _root,
    doc: IAbsence,
    { models, docModifier }: IContext
  ) {
    return models.Absences.createAbsence(docModifier(doc));
  },

  async solveAbsenceRequest(
    _root,
    { _id, status, ...doc }: IAbsenceEdit,
    { models }: IContext
  ) {
    const shiftRequest = await models.Absences.getAbsence(_id);
    let updated = models.Absences.updateAbsence(_id, {
      status: `${status}`,
      solved: true,
      ...doc
    });

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
        const newSchedule = await models.Schedules.createSchedule({
          userId: shiftRequest.userId,
          solved: true,
          status: 'Approved'
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

    return updated;
  },

  async solveScheduleRequest(
    _root,
    { _id, status, ...doc }: IScheduleEdit,
    { models }: IContext
  ) {
    const updated = models.Schedules.updateSchedule(_id, {
      status: `${status}`,
      solved: true,
      ...doc
    });

    await models.Shifts.updateMany(
      { scheduleId: _id, solved: false },
      { $set: { status: `${status}`, solved: true } }
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
      status: `${status}`,
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
        shiftEnd: shift.shiftEnd
      });
    });

    return schedule;
  },

  async submitSchedule(
    _root,
    { branchIds, departmentIds, userIds, shifts, scheduleConfigId },
    { subdomain, models }: IContext
  ) {
    if (userIds.length) {
      return createScheduleShiftsByUserIds(
        userIds,
        shifts,
        models,
        scheduleConfigId
      );
    }

    const concatBranchDept: string[] = [];

    if (branchIds) {
      for (const branchId of branchIds) {
        const branch = await findBranch(subdomain, branchId);
        concatBranchDept.push(...branch.userIds);
      }
    }
    if (departmentIds) {
      for (const deptId of departmentIds) {
        const department = await findDepartment(subdomain, deptId);
        concatBranchDept.push(...department.userIds);
      }
    }

    // prevent creating double schedule for common users
    const sorted = concatBranchDept.sort();
    const unionOfUserIds = sorted.filter((value, pos) => {
      return concatBranchDept.indexOf(value) === pos;
    });

    return createScheduleShiftsByUserIds(
      unionOfUserIds,
      shifts,
      models,
      scheduleConfigId
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
    { scheduleName, scheduleConfig, configShiftStart, configShiftEnd },
    { models }: IContext
  ) {
    const newScheduleConfig = await models.ScheduleConfigs.createScheduleConfig(
      {
        scheduleName: `${scheduleName}`,
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
        scheduleName: `${scheduleName}`,
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

  async extractAllDataFromMySQL(
    _root,
    { startDate, endDate },
    { subdomain }: IContext
  ) {
    return await connectAndQueryFromMySql(subdomain, startDate, endDate);
  }
};

moduleRequireLogin(timeclockMutations);

export default timeclockMutations;
