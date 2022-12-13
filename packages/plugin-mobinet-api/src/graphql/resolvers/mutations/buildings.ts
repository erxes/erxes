import { IContext } from '../../../connectionResolver';
import {
  IBuilding,
  IBuildingEdit
} from '../../../models/definitions/buildings';

const mutations = {
  buildingsAdd: async (_root, doc: IBuilding, { models }: IContext) => {
    return models.Buildings.createBuilding(doc);
  },

  buildingsEdit: async (_root, doc: IBuildingEdit, { models }: IContext) => {
    const { _id } = doc;
    return models.Buildings.updateBuilding(_id, doc);
  },

  buildingsRemove: (_root, { _id }, { models }: IContext) => {
    return models.Buildings.removeBuilding(_id);
  }
};

export default mutations;
