import type { IContext } from '@/posclient/@types/types';
import type { IOrderChangeLog } from '@/posclient/@types/orderChangeLogs';

export const OrderChangeLog = {
  async user(
    log: Pick<IOrderChangeLog, 'userId'>,
    _params: unknown,
    { models }: IContext,
  ) {
    if (!log.userId) {
      return null;
    }

    return models.PosUsers.findOne({ _id: log.userId }).lean();
  },
};
