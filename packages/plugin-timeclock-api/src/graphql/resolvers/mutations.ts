import { IContext } from '../../connectionResolver';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import {
  IAbsence,
  ISchedule,
  IShift,
  ITimeClock,
  IAbsenceType
} from '../../models/definitions/template';
import { putUpdateLog } from '@erxes/api-utils/src/logUtils';
import messageBroker from '../../messageBroker';
import { findBranch, findBranches } from '../../departments';

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

const templateMutations = {
  /**
   * Creates a new timeclock
   */
  async timeclockStart(
    _root,
    { userId, longitude, latitude },
    { models, user, subdomain }: IContext
  ) {
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

    let template;
    if (insideCoordinate) {
      template = await models.Templates.createTimeClock({
        shiftStart: new Date(),
        shiftActive: true,
        userId: userId ? `${userId}` : user._id
      });
    } else {
      throw new Error('User not in the coordinate');
    }
    return template;
  },

  async timeclockStop(
    _root,
    { _id, userId, longitude, latitude, ...doc }: ITimeClockEdit,
    { models, subdomain, user }: IContext
  ) {
    const timeclock = await models.Templates.findOne({
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
      updated = await models.Templates.updateTimeClock(_id, {
        shiftEnd: new Date(),
        shiftActive: false,
        ...doc
      });

      await putUpdateLog(
        subdomain,
        messageBroker(),
        {
          type: 'timeclock',
          object: timeclock,
          newData: doc
        },
        user
      );
    } else {
      throw new Error('User not in the coordinate');
    }

    return updated;
  },
  async absenceTypeAdd(
    _root,
    { name, explRequired, attachRequired },
    { models }: IContext
  ) {
    const explanationReqd: boolean = explRequired;
    const attachReqd: boolean = attachRequired;
    const absenceType = await models.AbsenceTypes.createAbsenceType({
      name: `${name}`,
      explRequired: explanationReqd,
      attachRequired: attachReqd
    });
    return absenceType;
  },

  async absenceTypeRemove(_root, { _id }, { models }: IContext) {
    const absenceType = await models.AbsenceTypes.removeAbsenceType(_id);
    return absenceType;
  },

  async absenceTypeEdit(
    _root,
    { _id, ...doc }: IAbsenceTypeEdit,
    { models }: IContext
  ) {
    const absenceType = await models.AbsenceTypes.getAbsenceType(_id);
    return models.AbsenceTypes.updateAbsenceType(_id, doc);
  },

  /**
   * Removes a single timeclock
   */
  async timeclockRemove(_root, { _id }, { models }: IContext) {
    const template = await models.Templates.removeTimeClock(_id);
    return template;
  },

  async sendAbsenceRequest(
    _root,
    doc: IAbsence,
    { models, docModifier }: IContext
  ) {
    const absence = await models.Absences.createAbsence(docModifier(doc));
    return absence;
  },

  async solveAbsenceRequest(
    _root,
    { _id, status, ...doc }: IAbsenceEdit,
    { models, subdomain, user }: IContext
  ) {
    const absence = models.Absences.getAbsence(_id);
    let updated = models.Absences.updateAbsence(_id, {
      status: `${status}`,
      solved: true,
      ...doc
    });

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        type: 'absence',
        object: absence,
        newData: doc
      },
      user
    );

    const shiftRequest = await absence;

    // if request is shift request
    if (shiftRequest.reason.toLocaleLowerCase() === 'shift request') {
      updated = models.Absences.updateAbsence(_id, { status: 'Shift', ...doc });
      const newSchedule = await models.Schedules.createSchedule({
        userId: user._id,
        solved: true,
        status: 'Approved'
      });

      const newShift = await models.Shifts.createShift({
        scheduleId: newSchedule._id,
        shiftStart: shiftRequest.startTime,
        shiftEnd: shiftRequest.endTime,
        solved: true,
        status: 'Approved'
      });

      const newTimeClock = await models.Templates.createTimeClock({
        userId: user._id,
        shiftStart: shiftRequest.startTime,
        shiftEnd: shiftRequest.endTime,
        shiftActive: false
      });
    }

    return updated;
  },

  async solveScheduleRequest(
    _root,
    { _id, status, ...doc }: IScheduleEdit,
    { models, subdomain, user }: IContext
  ) {
    const schedule = models.Schedules.getSchedule(_id);
    const updated = models.Schedules.updateSchedule(_id, {
      status: `${status}`,
      solved: true,
      ...doc
    });

    const updateScheduleShifts = await models.Shifts.updateMany(
      { scheduleId: _id, solved: false },
      { $set: { status: `${status}`, solved: true } }
    );

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        type: 'schedule',
        object: schedule,
        newData: doc
      },
      user
    );

    return updated;
  },

  async solveShiftRequest(
    _root,
    { _id, status, ...doc }: IShiftEdit,
    { models, subdomain, user }: IContext
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
      const updateSchedule = await models.Schedules.updateOne(
        { _id: shift.scheduleId },
        { $set: { solved: true, status: 'Solved' } }
      );
    }

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        type: 'schedule_shift',
        object: shift,
        newData: doc
      },
      user
    );

    return updated;
  },

  async sendScheduleRequest(_root, { userId, shifts }, { models }: IContext) {
    const schedule = await models.Schedules.createSchedule({
      userId: `${userId}`
    });

    shifts.map(shift => {
      models.Shifts.createShift({
        scheduleId: schedule._id,
        shiftStart: shift.shiftStart,
        shiftEnd: shift.shiftEnd
      });
    });

    return schedule;
  },

  async submitShift(_root, { userIds, shifts }, { models }: IContext) {
    let schedule;

    userIds.map(async userId => {
      schedule = await models.Schedules.createSchedule({
        userId: `${userId}`,
        solved: true,
        status: 'Approved'
      });

      shifts.map(shift => {
        models.Shifts.createShift({
          scheduleId: schedule._id,
          shiftStart: shift.shiftStart,
          shiftEnd: shift.shiftEnd,
          solved: true,
          status: 'Approved'
        });
      });
    });

    return schedule;
  },

  payDateAdd(_root, { dateNums }, { models }: IContext) {
    return models.PayDates.createPayDate({ payDates: dateNums });
  },

  payDateEdit(_root, { _id, dateNums }, { models }: IContext) {
    models.PayDates.getPayDate(_id);
    const updated = models.PayDates.updatePayDate(_id, { payDates: dateNums });
    return updated;
  },

  payDateRemove(_root, { _id }, { models }: IContext) {
    return models.PayDates.removePayDate(_id);
  }
};

// requireLogin(templateMutations, 'timeclocksAdd');

export default templateMutations;
