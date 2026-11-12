import { IModels } from '~/connectionResolvers';
import { getFxaTaxValues } from './fxaTaxValues';
import { getFxaIncomeTaxRates } from './fxaIncomeTaxRates';
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
): Promise<
  (T &
    ReturnType<typeof getFxaTaxValues> & {
      previous:
        | (IAdjustFxaDetailDocument & ReturnType<typeof getFxaTaxValues>)
        | null;
    })[]
> => {
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
  const [currentRates, previousRates] = await Promise.all([
    current
      ? getFxaIncomeTaxRates(models, current.date, details)
      : new Map<string, number | undefined>(),
    previous
      ? getFxaIncomeTaxRates(models, previous.date, previousDetails)
      : new Map<string, number | undefined>(),
  ]);
  const byLocation = new Map(
    previousDetails.map((detail) => [
      getFxaAdjustmentDetailKey(detail),
      {
        ...detail,
        ...getFxaTaxValues(
          detail,
          previousRates.get(detail.fixedAssetId || ''),
        ),
      },
    ]),
  );
  return details.map((detail) => ({
    ...detail,
    ...getFxaTaxValues(detail, currentRates.get(detail.fixedAssetId || '')),
    previous: byLocation.get(getFxaAdjustmentDetailKey(detail)) || null,
  }));
};
