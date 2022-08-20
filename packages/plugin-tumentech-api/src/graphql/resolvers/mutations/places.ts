import { IContext } from '../../../connectionResolver';
import { IPlace, IPlaceEdit } from '../../../models/definitions/places';

const placeMutations = {
  placesAdd: async (_root, doc: IPlace, { models }: IContext) => {
    return models.Places.createPlace(doc);
  },

  placesEdit: async (_root, doc: IPlaceEdit, { models }: IContext) => {
    return models.Places.updatePlace(doc);
  },

  placesRemove: (_root, { _id }, { models }: IContext) => {
    return models.Places.remove({ _id });
  },

  setDealPlace: (_root, args, { models }: IContext) => {
    return models.DealPlaces.createOrUpdateDealPlace(args);
  }
};

export default placeMutations;
