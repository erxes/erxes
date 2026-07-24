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

    return detail?.closingAccumulatedDepreciation || 0;
  },

  async bookValue(
    instance: IFxaInstanceDocument,
    _args: undefined,
    context: IContext,
  ) {
    const detail = await getLatestAdjustmentDetail(instance, context);
    const accumulatedDepreciation =
      detail?.closingAccumulatedDepreciation || 0;

    return (instance.originalCost || 0) - accumulatedDepreciation;
  },
};
