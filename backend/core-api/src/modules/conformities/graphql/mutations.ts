import { IContext } from '~/connectionResolvers';

import {
  IConformityAdd,
  IConformityEdit,
} from '@/conformities/db/definitions/conformities';

const conformityMutations = {
  /**
   * Create new conformity
   */
  async conformityAdd(_root, doc: IConformityAdd, { models }: IContext) {
    return models.Conformities.addConformity({ ...doc });
  },

  /**
   * Edit conformity
   */
  async conformityEdit(_root, doc: IConformityEdit, { models }: IContext) {
    return models.Conformities.editConformity({
      ...doc,
    });
  },
};

export default conformityMutations;
