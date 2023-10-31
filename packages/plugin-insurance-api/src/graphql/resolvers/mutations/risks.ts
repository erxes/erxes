import { IContext } from '../../../connectionResolver';
import { IRisk, IRiskDocument } from '../../../models/definitions/risks';

const mutations = {
  risksAdd: async (_root, doc: IRisk, { models, user }: IContext) => {
    return models.Risks.createRisk(doc, user ? user._id : '');
  },

  risksEdit: async (_root, doc: IRiskDocument, { models, user }: IContext) => {
    return models.Risks.updateRisk(doc, user._id);
  },

  risksRemove: async (_root, { _id }, { models }: IContext) => {
    await models.Risks.remove({ _id });
    return 'removed';
  }
};

export default mutations;
