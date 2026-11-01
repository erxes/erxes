import type { IModels } from '~/connectionResolvers';
import type { ICover } from '../@types/cover';

export const deleteCoverWithLog = async (
  models: IModels,
  cover: ICover,
  userId: string | undefined,
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  // The audit must be durable before the live document is removed.
  const log = await models.OrderChangeLogs.createLog({
    source: 'cover',
    coverId: cover._id,
    posToken: cover.posToken,
    userId,
    action: 'delete',
    changes: [{ field: 'cover', oldValue: cover, newValue: null }],
  });
  const result = await models.Covers.deleteOne({
    _id: cover._id,
    posToken: cover.posToken,
    status: cover.status,
    modifiedAt: cover.modifiedAt,
    // Compare stored values without Mongoose adding subdocument defaults.
    $expr: {
      $eq: [{ $ifNull: ['$details', []] }, { $literal: cover.details || [] }],
    },
  });
  if (!result.deletedCount) {
    // A known no-op must not leave a log claiming that the cover was deleted.
    // Keep the snapshot on an ambiguous database failure instead.
    if (result.acknowledged) {
      await models.OrderChangeLogs.deleteOne({
        _id: log._id,
        posToken: cover.posToken,
        source: 'cover',
      });
    }
    throw new Error('Cover changed; cannot delete it');
  }
  return {
    acknowledged: result.acknowledged,
    deletedCount: result.deletedCount,
  };
};
