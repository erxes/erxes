import { IContext } from '../../../connectionResolver';
import {
  IDistrict,
  IDistrictEdit
} from '../../../models/definitions/districts';

const cityMutations = {
  districtsAdd: async (_root, doc: IDistrict, { models }: IContext) => {
    return models.Districts.createDistrict(doc);
  },

  districtsEdit: async (_root, doc: IDistrictEdit, { models }: IContext) => {
    const { _id } = doc;
    return models.Districts.updateDistrict(_id, doc);
  },

  districtsRemove: (_root, { _id }, { models }: IContext) => {
    return models.Districts.removeDistrict(_id);
  }
};

export default cityMutations;
