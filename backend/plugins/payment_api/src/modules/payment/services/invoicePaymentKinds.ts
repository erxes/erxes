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

  // Sequential by design: each attempt retries only the invoices that lost the
  // compare-and-set in the previous attempt, and within an attempt the version
  // must be read before aggregating and writing.
  for (
    let attempt = 0;
    attempt < SYNC_MAX_ATTEMPTS && pending.length;
    attempt++
  ) {
    const invoices = await models.Invoices.find( // NOSONAR
      { _id: { $in: pending } },
      { _id: 1, paymentKindsVersion: 1 },
    ).lean();

    const kindsById = await aggregatePaymentKinds( // NOSONAR
      models,
      invoices.map(({ _id }) => _id),
    );

    const conflicts = await Promise.all( // NOSONAR
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
 * Marks invoices for a recount before their transactions change: removes
 * `paymentKinds` (the backfill picks up invoices without it) and bumps the
 * version so a sync that read the old state cannot write it back. Callers
 * mark first, change the transactions, then sync. If that sync fails the mark
 * stays, so recovery never depends on the failed call.
 */
export const markInvoicePaymentKindsStale = async (
  models: IModels,
  invoiceIds: string[],
) => {
  const ids = Array.from(new Set(invoiceIds.filter(Boolean)));

  if (!ids.length) {
    return;
  }

  await models.Invoices.updateMany(
    { _id: { $in: ids } },
    { $unset: { paymentKinds: 1 }, $inc: { paymentKindsVersion: 1 } },
  );
};

/**
 * `syncInvoicePaymentKinds` for callers that already marked the invoices
 * stale: a failure is logged instead of thrown, because the mark already
 * hands the invoices to the backfill.
 */
export const syncMarkedInvoicePaymentKinds = async (
  models: IModels,
  invoiceIds: string[],
) => {
  try {
    await syncInvoicePaymentKinds(models, invoiceIds);
  } catch (e) {
    console.error(
      `Payment kinds sync failed for invoices ${invoiceIds.join(', ')}; the backfill will recompute them: ${e.message}`,
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

  // Batches must run in order: each one reads the invoices the previous batch
  // left unfilled, and running them one at a time keeps the DB load bounded.
  for (let batch = 0; batch < BACKFILL_MAX_BATCHES; batch++) {
    const invoices = await models.Invoices.find( // NOSONAR
      { paymentKinds: { $exists: false } },
      { _id: 1 },
    )
      .limit(BACKFILL_BATCH)
      .lean();

    if (!invoices.length) {
      break;
    }

    await syncInvoicePaymentKinds( // NOSONAR
      models,
      invoices.map(({ _id }) => _id),
    );

    updated += invoices.length;
  }

  return updated;
};