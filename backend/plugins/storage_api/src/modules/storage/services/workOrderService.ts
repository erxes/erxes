import { Error as MongooseError } from 'mongoose';
import { IModels } from '../db/models/Storage';
import { runMovement } from './movementService';
import { LIMITS, StorageInputError } from './validation';

const isVersionError = (e: unknown) => e instanceof MongooseError.VersionError;

/** Re-runs `fn` when another request saved the same work order in between. */
const withVersionRetry = async <T>(fn: () => Promise<T>, attempt = 0): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (!isVersionError(e) || attempt + 1 >= LIMITS.CAS_RETRIES) throw e;
    return withVersionRetry(fn, attempt + 1);
  }
};

const loadWorkOrder = async (models: IModels, workOrderId: string) => {
  const wo = await models.WorkOrders.findById(workOrderId);
  if (!wo) throw new StorageInputError('Ажлын захиалга олдсонгүй.');
  return wo;
};

/**
 * Sets the cumulative completion % of a work order: every cost line ends up
 * with `closedAmount = totalAmount × percent`. Calling it with 50 twice leaves
 * the order at 50%, not 75%. Lowering the % is done line by line via reopen.
 */
export const closeWorkOrderPercent = async (
  models: IModels,
  params: { workOrderId: string; percent: number; requestKey?: string | null },
  userId?: string,
) => {
  if (typeof params.percent !== 'number' || !Number.isFinite(params.percent) || params.percent < 0 || params.percent > 100) {
    throw new StorageInputError('Гүйцэтгэлийн хувь 0-100 хооронд байх ёстой.');
  }

  const ratio = params.percent / 100;

  return runMovement(models, {
    type: 'WO_CLOSE',
    requestKey: params.requestKey,
    userId,
    apply: () =>
      withVersionRetry(async () => {
        const wo = await loadWorkOrder(models, params.workOrderId);

        const ahead = wo.costLines.filter((l) => l.closedAmount > Math.round(l.totalAmount * ratio));
        if (ahead.length > 0) {
          throw new StorageInputError(
            `${ahead.length} мөр ${params.percent}%-иас их хаагдсан байна. Эхлээд тэдгээрийг буцааж нээнэ үү.`,
          );
        }

        wo.costLines.forEach((line) => {
          line.closedAmount = Math.round(line.totalAmount * ratio);
        });
        await wo.save();

        return { workOrderId: String(wo._id) };
      }),
  });
};

export const reopenWorkOrderLine = async (
  models: IModels,
  params: { workOrderId: string; costLineId: string; requestKey?: string | null },
  userId?: string,
) =>
  runMovement(models, {
    type: 'WO_REOPEN',
    requestKey: params.requestKey,
    userId,
    apply: () =>
      withVersionRetry(async () => {
        const wo = await loadWorkOrder(models, params.workOrderId);
        const line = wo.costLines.find((l) => String(l._id) === params.costLineId);
        if (!line) throw new StorageInputError('Зардлын мөр олдсонгүй.');

        line.closedAmount = 0;
        await wo.save();

        return { workOrderId: String(wo._id) };
      }),
  });
