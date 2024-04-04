import { IContext } from '../../../connectionResolver';
import { ILabelDocument } from '../../../models/definitions/labels';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Labels.findOne({ _id });
  },

  async rules(label: ILabelDocument, _, {}: IContext) {
    if (!label.rules) {
      return [];
    }
    return label.rules;
  }
};
