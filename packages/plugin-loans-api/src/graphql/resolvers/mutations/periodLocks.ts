import { gatherDescriptions } from '../../../utils';
import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import messageBroker from '../../../messageBroker';
import {
  IPeriodLock,
  IPeriodLockDocument
} from '../../../models/definitions/periodLocks';

const periodLockMutations = {
  periodLocksAdd: async (
    _root,
    doc: IPeriodLock,
    { user, models, subdomain }: IContext
  ) => {
    doc.createdBy = user._id;
    const periodLock = await models.PeriodLocks.createPeriodLock(doc);

    const logData = {
      type: 'periodLock',
      object: periodLock,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker(),
      {
        newData: doc,
        ...logData,
        ...descriptions
      },
      user
    );

    return periodLock;
  },
  /**
   * Updates a periodLock
   */
  periodLocksEdit: async (
    _root,
    { _id, ...doc }: IPeriodLockDocument,
    { models, user, subdomain }: IContext
  ) => {
    const periodLock = await models.PeriodLocks.getPeriodLock({ _id });
    const updated = await models.PeriodLocks.updatePeriodLock(_id, doc);

    const logData = {
      type: 'periodLock',
      object: periodLock,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        newData: { ...doc },
        updatedDocument: updated,
        ...logData,
        ...descriptions
      },
      user
    );

    return updated;
  },

  /**
   * Removes periodLocks
   */

  periodLocksRemove: async (
    _root,
    { periodLockIds }: { periodLockIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const periodLocks = await models.PeriodLocks.find({
      _id: { $in: periodLockIds }
    }).lean();

    await models.PeriodLocks.removePeriodLocks(periodLockIds);

    for (const periodLock of periodLocks) {
      const logData = {
        type: 'periodLock',
        object: periodLock,
        extraParams: { models }
      };

      const descriptions = gatherDescriptions(logData);
      await putDeleteLog(
        subdomain,
        messageBroker(),
        {
          ...logData,
          ...descriptions
        },
        user
      );
    }

    return periodLockIds;
  }
};

checkPermission(periodLockMutations, 'periodLocksAdd', 'managePeriodLocks');
checkPermission(periodLockMutations, 'periodLocksEdit', 'managePeriodLocks');
checkPermission(periodLockMutations, 'periodLocksRemove', 'managePeriodLocks');

export default periodLockMutations;
