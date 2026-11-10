import { IModels } from '~/connectionResolvers';
import {
  ADJ_FXA_STATUSES,
  IAdjustFxaDetail,
  IAdjustFxaDetailDocument,
} from '../@types/adjustFixedAsset';

export const getPreviousFxaAdjustment = (
  models: IModels,
  date: Date,
  excludeId?: string,
) =>
  models.AdjustFixedAssets.findOne({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    date: { $lt: date },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
  })
    .sort({ date: -1 })
    .lean();

export const getFxaAdjustmentDetailKey = (
  detail: Pick<IAdjustFxaDetail, 'fixedAssetId' | 'branchId' | 'departmentId'>,
): string =>
  JSON.stringify([
    detail.fixedAssetId || '',
    detail.branchId || '',
    detail.departmentId || '',
  ]);

export const attachPreviousFxaDetails = async <T extends IAdjustFxaDetail>(
  models: IModels,
  adjustId: string,
  details: T[],
): Promise<(T & { previous: IAdjustFxaDetailDocument | null })[]> => {
  if (!details.length) return [];
  const current = await models.AdjustFixedAssets.findOne({
    _id: adjustId,
  }).lean();
  const previous = current
    ? await getPreviousFxaAdjustment(models, current.date)
    : null;
  const previousDetails = previous
    ? await models.AdjustFxaDetails.find({
        adjustId: previous._id,
        fixedAssetId: {
          $in: [
            ...new Set(
              details.map((detail) => detail.fixedAssetId).filter(Boolean),
            ),
          ],
        },
      }).lean()
    : [];
  const byLocation = new Map(
    previousDetails.map((detail) => [
      getFxaAdjustmentDetailKey(detail),
      detail,
    ]),
  );
  return details.map((detail) => ({
    ...detail,
    previous: byLocation.get(getFxaAdjustmentDetailKey(detail)) || null,
  }));
};
