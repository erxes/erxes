import { IContext } from '../../../connectionResolver';
import { ICity, ICityEdit } from '../../../models/definitions/cities';

const cityMutations = {
  citiesAdd: async (_root, doc: ICity, { models }: IContext) => {
    return models.Cities.createCity(doc);
  },

  citiesEdit: async (_root, doc: ICityEdit, { models }: IContext) => {
    const { _id } = doc;
    return models.Cities.updateCity(_id, doc);
  },

  citiesRemove: (_root, { _ids }, { models }: IContext) => {
    return models.Cities.deleteMany({ _id: { $in: _ids } });
  }
};

export default cityMutations;
