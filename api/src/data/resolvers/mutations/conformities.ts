import { Conformities } from '../../../db/models';
import { IConformityAdd, IConformityEdit } from '../../../db/models/definitions/conformities';

const conformityMutations = {
  /**
   * Create new conformity
   */
  async conformityAdd(_root, doc: IConformityAdd) {
    return Conformities.addConformity({ ...doc });
  },

  /**
   * Edit conformity
   */
  async conformityEdit(_root, doc: IConformityEdit) {
    return Conformities.editConformity({ ...doc });
  },
};

export default conformityMutations;
