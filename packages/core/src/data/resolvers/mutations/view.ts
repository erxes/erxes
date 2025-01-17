import { IContext } from '../../../connectionResolver';
import { IViewDocument } from '../../../db/models/definitions/views';

const viewMutations = {
  viewAdd: async (_root, doc: IViewDocument, { user, models }: IContext) => {
    return await models.Views.createView(doc, user);
  },

  viewEdit: async (
    _root,
    { _id, ...doc }: IViewDocument,
    { user, models }: IContext,
  ) => {
    return await models.Views.updateView(_id, doc, user);
  },

  viewRemove: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return await models.Views.removeView(_id);
  },
};

export default viewMutations;
