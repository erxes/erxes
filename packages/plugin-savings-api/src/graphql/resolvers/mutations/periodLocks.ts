import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendMessageBroker } from '../../../messageBroker';
import {
  IPeriodLock,
  IPeriodLockDocument
} from '../../../models/definitions/periodLocks';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const periodLockMutations = {
  savingsPeriodLocksAdd: async (
    _root,
    doc: IPeriodLock,
    { user, models, subdomain }: IContext
  ) => {
    doc.createdBy = user._id;
    const periodLock = await models.PeriodLocks.createPeriodLock(
      doc,
      subdomain
    );

    const logData = {
      type: 'periodLock',
      object: periodLock,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return periodLock;
  },
  /**
   * Updates a periodLock
   */
  savingsPeriodLocksEdit: async (
    _root,
    { _id, ...doc }: IPeriodLockDocument,
    { models, user, subdomain }: IContext
  ) => {
    const periodLock = await models.PeriodLocks.getPeriodLock({ _id });
    const updated = await models.PeriodLocks.updatePeriodLock(
      _id,
      doc,
      subdomain
    );

    const logData = {
      type: 'periodLock',
      object: periodLock,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Removes periodLocks
   */

  savingsPeriodLocksRemove: async (
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
      await sendMessageBroker(
        {
          action: 'deleteTransaction',
          subdomain,
          data: { orderId: periodLock._id, config: {} },
          isRPC: true
        },
        'syncerkhet'
      );

      const logData = {
        type: 'periodLock',
        object: periodLock,
        extraParams: { models }
      };

      await deleteLog(subdomain, user, logData);
    }

    return periodLockIds;
  }
};

// checkPermission(periodLockMutations, 'periodLocksAdd', 'managePeriodLocks');
// checkPermission(periodLockMutations, 'periodLocksEdit', 'managePeriodLocks');
// checkPermission(periodLockMutations, 'periodLocksRemove', 'managePeriodLocks');

export default periodLockMutations;
