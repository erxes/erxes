import { fixNum } from 'erxes-api-shared/utils';
import { IFxaInstanceDocument } from '@/fixedAssets/@types/fxaInstance';
import { IContext } from '~/connectionResolvers';

const getLatestAdjustmentDetail = async (
  instance: IFxaInstanceDocument,
  { models }: IContext,
) =>
  models.AdjustFxaDetails.findOne({ fxaInstanceId: instance._id })
    .sort({ createdAt: -1 })
    .lean();

export const FxaInstance = {
  async accumulatedDepreciation(
    instance: IFxaInstanceDocument,
    _args: undefined,
    context: IContext,
  ) {
    const detail = await getLatestAdjustmentDetail(instance, context);
    const count = instance.currentCount ?? instance.count ?? 1;

    return fixNum((detail?.closingAccumulatedDepreciation || 0) * count);
  },

  async bookValue(
    instance: IFxaInstanceDocument,
    _args: undefined,
    context: IContext,
  ) {
    const detail = await getLatestAdjustmentDetail(instance, context);
    const count = instance.currentCount ?? instance.count ?? 1;
    const accumulatedDepreciation =
      (detail?.closingAccumulatedDepreciation || 0) * count;

    return fixNum((instance.originalCost || 0) * count - accumulatedDepreciation);
  },
};
