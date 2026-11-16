import { IModels, StockMovementType } from '../db/models/Storage';
import { isDuplicateKeyError, newRequestKey, parseTxDate, StorageInputError } from './validation';

export interface IMovementContext {
  movementId: string;
  txDate: Date;
}

interface IRunMovementParams<TStored> {
  type: StockMovementType;
  requestKey?: string | null;
  txDate?: Date | string | null;
  userId?: string;
  /** Applies the change. Must undo its own partial writes before throwing. */
  apply: (ctx: IMovementContext) => Promise<TStored>;
}

/** Statuses that block postings dated on or before `closedUntil`. */
const BLOCKING_CLOSE_STATUSES = ['CLOSING', 'CLOSED'];

/**
 * Runs a stock/cost mutation through the movement ledger.
 *
 * - Idempotency: `requestKey` is unique, so a retried request with the same key
 *   returns the stored result instead of applying the change twice.
 * - Period close coordination (two-phase): the movement is first written as
 *   PENDING, then the closed-period check runs. `closePeriod` does the reverse
 *   (writes CLOSING, then looks for PENDING movements). Whichever writes second
 *   sees the other, so a close and a posting can never both succeed.
 *
 * Returns the stored result; callers turn it into the GraphQL payload.
 */
export const runMovement = async <TStored extends Record<string, unknown>>(
  models: IModels,
  params: IRunMovementParams<TStored>,
): Promise<TStored> => {
  const txDate = parseTxDate(params.txDate);
  const requestKey = params.requestKey || newRequestKey();

  const movement = await claimMovement(models, {
    requestKey,
    type: params.type,
    txDate,
    userId: params.userId,
  });

  if (movement.replay) {
    return movement.replay as TStored;
  }

  const movementId = movement.id;

  try {
    await assertPeriodOpen(models, txDate);
    const result = await params.apply({ movementId, txDate });
    await models.StockMovements.updateOne(
      { _id: movementId },
      { $set: { status: 'POSTED', result } },
    );
    return result;
  } catch (e) {
    await models.StockMovements.updateOne(
      { _id: movementId },
      { $set: { status: 'FAILED', error: (e as Error).message } },
    );
    throw e;
  }
};

const claimMovement = async (
  models: IModels,
  doc: { requestKey: string; type: StockMovementType; txDate: Date; userId?: string },
): Promise<{ id: string; replay?: unknown }> => {
  try {
    const created = await models.StockMovements.create({ ...doc, status: 'PENDING' });
    return { id: String(created._id) };
  } catch (e) {
    if (!isDuplicateKeyError(e)) throw e;
  }

  const existing = await models.StockMovements.findOne({ requestKey: doc.requestKey }).lean();

  if (!existing) {
    throw new StorageInputError('Гүйлгээний түлхүүрийг шалгаж чадсангүй. Дахин оролдоно уу.');
  }

  if (existing.type !== doc.type) {
    throw new StorageInputError('Энэ requestKey өөр төрлийн гүйлгээнд ашиглагдсан байна.');
  }

  if (existing.status === 'POSTED') {
    return { id: String(existing._id), replay: existing.result };
  }

  if (existing.status === 'PENDING') {
    throw new StorageInputError('Энэ гүйлгээ боловсруулагдаж байна. Түр хүлээгээд дахин шалгана уу.');
  }

  // FAILED: allow the same key to be retried, but only by one caller at a time.
  const retried = await models.StockMovements.findOneAndUpdate(
    { _id: existing._id, status: 'FAILED' },
    { $set: { status: 'PENDING', txDate: doc.txDate, error: null } },
    { new: true },
  );

  if (!retried) {
    throw new StorageInputError('Энэ гүйлгээ боловсруулагдаж байна. Түр хүлээгээд дахин шалгана уу.');
  }

  return { id: String(retried._id) };
};

export const assertPeriodOpen = async (models: IModels, txDate: Date) => {
  const blocking = await models.PeriodCloses.findOne({
    status: { $in: BLOCKING_CLOSE_STATUSES },
    closedUntil: { $gte: txDate },
  }).lean();

  if (blocking) {
    throw new StorageInputError(
      `Тухайн огноо (${txDate.toISOString().slice(0, 10)}) нь хаалт хийгдсэн хугацаанд байна. Эхлээд хаалтыг нээнэ үү.`,
    );
  }
};

export const closePeriod = async (models: IModels, closedUntilInput: Date | string, userId: string) => {
  const closedUntil = parseTxDate(closedUntilInput);

  // Phase 1: announce the close. New postings dated <= closedUntil now fail their check.
  const close = await models.PeriodCloses.create({ closedUntil, closedBy: userId, status: 'CLOSING' });

  // Phase 2: refuse to close while postings that passed their check are still in flight.
  const inFlight = await models.StockMovements.countDocuments({
    status: 'PENDING',
    txDate: { $lte: closedUntil },
  });

  if (inFlight > 0) {
    await models.PeriodCloses.updateOne({ _id: close._id }, { $set: { status: 'ABORTED' } });
    throw new StorageInputError(
      `Хаалт хийх хугацаанд ${inFlight} гүйлгээ боловсруулагдаж байна. Түр хүлээгээд дахин оролдоно уу.`,
    );
  }

  await models.PeriodCloses.updateOne({ _id: close._id }, { $set: { status: 'CLOSED' } });
  return models.PeriodCloses.findById(close._id).lean();
};

export const reopenPeriod = async (models: IModels, closeId: string, userId: string) => {
  const reopened = await models.PeriodCloses.findOneAndUpdate(
    { _id: closeId, status: 'CLOSED' },
    { $set: { status: 'REOPENED', reopenedBy: userId } },
    { new: true },
  ).lean();

  if (!reopened) {
    throw new StorageInputError('Нээх боломжтой хаалт олдсонгүй.');
  }

  return reopened;
};
