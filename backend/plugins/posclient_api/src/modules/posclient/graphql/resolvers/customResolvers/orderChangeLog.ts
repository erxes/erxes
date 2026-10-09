import type { IContext } from '@/posclient/@types/types';
import type { IOrderChangeLog } from '@/posclient/@types/orderChangeLogs';

export default {
  async orderNumber(
    log: IOrderChangeLog,
    _params: unknown,
    { models, config }: IContext,
  ): Promise<string | null> {
    if (!log.orderId || log.posToken !== config.token) {
      return null;
    }

    const snapshotNumber = (entry: IOrderChangeLog): string | null => {
      const snapshot = entry.changes.find(
        (change) => change.field === 'order',
      )?.oldValue;
      return snapshot &&
        typeof snapshot === 'object' &&
        'number' in snapshot &&
        typeof snapshot.number === 'string'
        ? snapshot.number
        : null;
    };

    const number = snapshotNumber(log);
    if (number) {
      return number;
    }

    const order = await models.Orders.findOne({
      _id: log.orderId,
      $or: [{ posToken: config.token }, { subToken: config.token }],
    })
      .select('number')
      .lean();
    if (order) {
      return order.number || null;
    }

    const cancellation = await models.OrderChangeLogs.findOne({
      orderId: log.orderId,
      posToken: config.token,
      action: 'cancel',
    })
      .sort({ createdAt: -1 })
      .lean();
    return cancellation ? snapshotNumber(cancellation) : null;
  },
  async user(
    log: Pick<IOrderChangeLog, 'userId'>,
    _params: unknown,
    { models }: IContext,
  ) {
    if (!log.userId) {
      return null;
    }

    return await models.PosUsers.findOne({ _id: log.userId }).lean();
  },
};
