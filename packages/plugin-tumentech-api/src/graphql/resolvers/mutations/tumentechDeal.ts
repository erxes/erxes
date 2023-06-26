import { IContext } from '../../../connectionResolver';
import { ITumentechDeal } from '../../../models/definitions/tumentechDeal';

export interface ITumentechDealEdit extends ITumentechDeal {
  _id: string;
}

const tumentechDealMutations = {
  tumentechDealAdd: async (
    _root,
    doc: ITumentechDeal,
    { models }: IContext
  ) => {
    return models.TumentechDeals.createTumentechDeal(doc);
  },

  tumentechDealEdit: async (
    _root,
    doc: ITumentechDealEdit,
    { models }: IContext
  ) => {
    return models.TumentechDeals.updateTumentechDeal(doc);
  },

  tumentechDealRemove: (_root, { _id }, { models }: IContext) => {
    return models.TumentechDeals.remove({ _id });
  }
};

export default tumentechDealMutations;
