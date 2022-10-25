import { IContext } from '../../connectionResolver';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { ITimeClock } from '../../models/definitions/template';
import { putUpdateLog } from '@erxes/api-utils/src/logUtils';
import messageBroker from '../../messageBroker';

interface ITimeClockEdit extends ITimeClock {
  _id: string;
  time: Date;
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
   * Edits a new timeclock
   */
  // async timeclocksEdit(
  //   _root,
  //   { _id, ...doc }: ITimeClockEdit,
  //   { models, subdomain, user }: IContext
  // ) {
  //   const timeclock = await models.Templates.getTimeClock(_id);
  //   const updated = await models.Templates.updateTimeClock(_id, doc);
  //   await putUpdateLog(
  //     subdomain,
  //     messageBroker(),
  //     { type: 'timeclock', object: timeclock, newData: doc },
  //     user
  //   );

  //   return updated;
  // },

  /**
   * Removes a single timeclock
   */
  async timeclockRemove(_root, { _id }, { models }: IContext) {
    const template = await models.Templates.removeTimeClock(_id);
    return template;
  }
};

// commented out for testing purposes
// requireLogin(templateMutations, 'timeclocksAdd');

export default templateMutations;
