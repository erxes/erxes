import { IContext } from '../../../connectionResolver';
import { IAdvertisement } from '../../../models/definitions/adviertisement';

export interface IAdvertisementEdit extends IAdvertisement {
  _id: string;
}

const advertisementMutations = {
  advertisementAdd: async (
    _root,
    doc: IAdvertisement,
    { models }: IContext,
  ) => {
    return models.Advertisement.createAdvertisement(doc);
  },

  advertisementEdit: async (
    _root,
    doc: IAdvertisementEdit,
    { models }: IContext,
  ) => {
    return models.Advertisement.updateAdvertisement(doc);
  },

  advertisementRemove: (_root, { _id }, { models }: IContext) => {
    return models.Advertisement.remove({ _id });
  },
};

export default advertisementMutations;
