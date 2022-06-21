import { IContext } from '../../../connectionResolver';
import { ILabel, ILabelDocument } from '../../../models/definitions/labels';

const labelsMutations = {
  saveLabels: async (
    _root: any,
    doc: { update: ILabelDocument[]; add: ILabel[] },
    { models }: IContext
  ) => {
    return await models.Labels.saveLabels(doc);
  },

  removeLabel: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Labels.removeLabel(_id);
  }
};

export default labelsMutations;
