import { IContext } from '../../../connectionResolver';
import { IQuarter, IQuarterEdit } from '../../../models/definitions/quarters';

const mutations = {
  quartersAdd: async (_root, doc: IQuarter, { models }: IContext) => {
    return models.Quarters.createQuarter(doc);
  },

  quartersEdit: async (_root, doc: IQuarterEdit, { models }: IContext) => {
    const { _id } = doc;
    return models.Quarters.updateQuarter(_id, doc);
  },

  quartersRemove: (_root, { _id }, { models }: IContext) => {
    return models.Quarters.removeQuarter(_id);
  }
};

export default mutations;
