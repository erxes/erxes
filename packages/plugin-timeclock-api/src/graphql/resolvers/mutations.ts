import { IContext } from '../../connectionResolver';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import {
  IAbsence,
  ISchedule,
  ITimeClock
} from '../../models/definitions/template';
import { putUpdateLog } from '@erxes/api-utils/src/logUtils';
import messageBroker from '../../messageBroker';

interface ITimeClockEdit extends ITimeClock {
  _id: string;
  time: Date;
}

interface IAbsenceEdit extends IAbsence {
  _id: string;
  status: string;
}

interface IScheduleEdit extends ISchedule {
  _id: string;
  status: string;
}
const templateMutations = {
  /**
   * Creates a new timeclock
   */
  async timeclockStart(_root, { time, userId }, { models }: IContext) {
    const template = await models.Templates.createTimeClock({
      shiftStart: time,
      userId: `${userId}`
    });
    return template;
  },

  async timeclockStop(
    _root,
    { _id, time, ...doc }: ITimeClockEdit,
    { models, subdomain, user }: IContext
  ) {
    const timeclock = await models.Templates.getTimeClock(_id);
    const updated = await models.Templates.updateTimeClock(_id, {
      shiftEnd: time,
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

    return updated;
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
    const updated = models.Absences.updateAbsence(_id, {
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
  async sendScheduleRequest(
    _root,
    doc: ISchedule,
    { models, docModifier }: IContext
  ) {
    const schedule = models.Schedules.createSchedule(docModifier(doc));
    return schedule;
  }
};

// requireLogin(templateMutations, 'timeclocksAdd');

export default templateMutations;
