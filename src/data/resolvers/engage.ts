import { Brands, Segments, Tags, Users } from '../../db/models';
import { IEngageMessageDocument } from '../../db/models/definitions/engages';
import { IContext } from '../types';

export default {
  segments(engageMessage: IEngageMessageDocument) {
    return Segments.find({ _id: { $in: engageMessage.segmentIds } });
  },

  brands(engageMessage: IEngageMessageDocument) {
    return Brands.find({ _id: { $in: engageMessage.brandIds } });
  },

  tags(engageMessage: IEngageMessageDocument) {
    return Tags.find({ _id: { $in: engageMessage.tagIds } });
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return Users.findOne({ _id: engageMessage.fromUserId });
  },

  getTags(engageMessage: IEngageMessageDocument) {
    return Tags.find({ _id: { $in: engageMessage.tagIds || [] } });
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;

    if (messenger && messenger.brandId) {
      return Brands.findOne({ _id: messenger.brandId });
    }
  },

  stats(engageMessage: IEngageMessageDocument, _args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesStats(engageMessage._id);
  },
};
