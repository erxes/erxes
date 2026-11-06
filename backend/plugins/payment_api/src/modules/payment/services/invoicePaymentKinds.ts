import { IModels } from '~/connectionResolvers';

const BACKFILL_BATCH = 500;
const BACKFILL_MAX_BATCHES = 50;

const SYNC_MAX_ATTEMPTS = 5;

const aggregatePaymentKinds = async (models: IModels, ids: string[]) => {
  const grouped: { _id: string; kinds: (string | null)[] }[] =
    await models.Transactions.aggregate([
      { $match: { invoiceId: { $in: ids } } },
      { $group: { _id: '$invoiceId', kinds: { $addToSet: '$paymentKind' } } },
    ]);

  return new Map(
    grouped.map(({ _id, kinds }) => [
      _id,
      kinds.filter((kind): kind is string => !!kind),
    ]),
  );
};

/**
 * Recomputes `paymentKinds` (the distinct kinds of the invoice's own
 * transactions) for the given invoices. Invoices without transactions get an
 * empty array, which also marks them as backfilled.
 *
 * Concurrent syncs of one invoice are serialized with a compare-and-set on
 * `paymentKindsVersion`: the version is read before the transactions are
 * aggregated, and the write only applies if no other sync wrote in between.
 * A sync that loses re-reads and retries, so an older snapshot can never
 * overwrite a newer one. If an invoice is still contended after the last
 * attempt, its field is removed so the backfill recomputes it.
 */
export const syncInvoicePaymentKinds = async (
  models: IModels,
  invoiceIds: string[],
) => {
  let pending = Array.from(new Set(invoiceIds.filter(Boolean)));

  for (
    let attempt = 0;
    attempt < SYNC_MAX_ATTEMPTS && pending.length;
    attempt++
  ) {
    const invoices = await models.Invoices.find(
      { _id: { $in: pending } },
      { _id: 1, paymentKindsVersion: 1 },
    ).lean();

    const kindsById = await aggregatePaymentKinds(
      models,
      invoices.map(({ _id }) => _id),
    );

    const conflicts = await Promise.all(
      invoices.map(async ({ _id, paymentKindsVersion }) => {
        const { modifiedCount } = await models.Invoices.updateOne(
          { _id, paymentKindsVersion: paymentKindsVersion ?? null },
          {
            $set: { paymentKinds: kindsById.get(_id) || [] },
            $inc: { paymentKindsVersion: 1 },
          },
        );

        return modifiedCount ? null : _id;
      }),
    );

    pending = conflicts.filter((_id): _id is string => !!_id);
  }

  if (pending.length) {
    await models.Invoices.updateMany(
      { _id: { $in: pending } },
      { $unset: { paymentKinds: 1 } },
    );
  }
};

/**
 * Fills `paymentKinds` on invoices created before the field existed, in
 * batches. Runs from the per-org pending-invoice job; once every invoice has
 * the field this is a single indexed lookup that finds nothing.
 */
export const backfillInvoicePaymentKinds = async (models: IModels) => {
  let updated = 0;

  for (let batch = 0; batch < BACKFILL_MAX_BATCHES; batch++) {
    const invoices = await models.Invoices.find(
      { paymentKinds: { $exists: false } },
      { _id: 1 },
    )
      .limit(BACKFILL_BATCH)
      .lean();

    if (!invoices.length) {
      break;
    }

    await syncInvoicePaymentKinds(
      models,
      invoices.map(({ _id }) => _id),
    );

    updated += invoices.length;
  }

  return updated;
};
