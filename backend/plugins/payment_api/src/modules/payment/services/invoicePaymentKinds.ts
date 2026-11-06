import { IModels } from '~/connectionResolvers';

const BACKFILL_BATCH = 500;
const BACKFILL_MAX_BATCHES = 50;

/**
 * Recomputes `paymentKinds` (the distinct kinds of the invoice's own
 * transactions) for the given invoices. Each invoice only reads its own
 * transactions, so the work is bounded by the ids passed in. Invoices without
 * transactions get an empty array, which also marks them as backfilled.
 */
export const syncInvoicePaymentKinds = async (
  models: IModels,
  invoiceIds: string[],
) => {
  const ids = Array.from(new Set(invoiceIds.filter(Boolean)));

  if (!ids.length) {
    return;
  }

  const grouped: { _id: string; kinds: (string | null)[] }[] =
    await models.Transactions.aggregate([
      { $match: { invoiceId: { $in: ids } } },
      { $group: { _id: '$invoiceId', kinds: { $addToSet: '$paymentKind' } } },
    ]);

  const kindsById = new Map(
    grouped.map(({ _id, kinds }) => [
      _id,
      kinds.filter((kind): kind is string => !!kind),
    ]),
  );

  await models.Invoices.bulkWrite(
    ids.map((_id) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { paymentKinds: kindsById.get(_id) || [] } },
      },
    })),
    { ordered: false },
  );
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
