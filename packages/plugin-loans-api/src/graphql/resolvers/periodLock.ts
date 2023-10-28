import { IContext } from '../../connectionResolver';
import { IPeriodLockDocument } from '../../models/definitions/periodLocks';

const periodLockResolvers = {
  async generals(periodLock: IPeriodLockDocument, {}, { models }: IContext) {
    console.log('periodLock', periodLock);
    return await models.General.find({ periodLockId: periodLock._id });
  }
};

export default periodLockResolvers;
