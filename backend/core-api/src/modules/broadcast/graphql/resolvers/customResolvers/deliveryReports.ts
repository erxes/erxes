import { IDeliveryReportsDocument } from '@/broadcast/@types';
import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference(
    { _id }: IDeliveryReportsDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.DeliveryReports.findOne({ _id });
  },
  async engage(
    { engageMessageId }: IDeliveryReportsDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.EngageMessages.findOne(
      { _id: engageMessageId },
      { title: 1 },
    );
  },
};
