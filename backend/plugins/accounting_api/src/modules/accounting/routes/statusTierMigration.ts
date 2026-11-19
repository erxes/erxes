import { Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { TR_STATUSES } from '../@types/constants';

// Before the status tiers, business statuses counted as real. They are now
// soon, so existing rows move to the posted `ongoing` status to keep balances.
const LEGACY_REAL_BUSINESS_STATUSES = [
  TR_STATUSES.PROGRESS,
  TR_STATUSES.ASSIGNED,
  TR_STATUSES.CONFIRMED,
];

export const migrateTransactionStatusTiers = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.body?.userId || String(req.headers.userid || '');

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const models = await generateModels(getSubdomain(req));
    const filter = { status: { $in: LEGACY_REAL_BUSINESS_STATUSES } };
    const [businessCount, cancelledCount] = await Promise.all([
      models.Transactions.countDocuments(filter),
      models.Transactions.countDocuments({ status: TR_STATUSES.CANELLED }),
    ]);

    let migratedCount = 0;

    if (!req.body?.dryRun && businessCount) {
      const result = await models.Transactions.updateMany(filter, {
        $set: { status: TR_STATUSES.ONGOING },
      });
      migratedCount = result.modifiedCount;
    }

    return res.json({
      businessCount,
      migratedCount,
      // Cancelled rows used to be real and are now omitted; their cached
      // inventory remainders need reCalcRemainders after this migration.
      cancelledCount,
    });
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Status tier migration failed',
    });
  }
};
