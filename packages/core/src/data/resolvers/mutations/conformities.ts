import { IContext } from '../../types';
import { sendCardsMessage } from '../../../messageBroker';
import { Conformities } from '../../../db/models';
import {
  IConformityAdd,
  IConformityEdit
} from '../../../db/models/definitions/conformities';

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
  async conformityEdit(_root, doc: IConformityEdit, { subdomain }: IContext) {
    const { addedTypeIds, removedTypeIds } = await Conformities.editConformity({
      ...doc
    });

    await sendCardsMessage({
      subdomain,
      action: 'publishHelperItems',
      data: {
        addedTypeIds,
        removedTypeIds,
        doc
      }
    });
  }
};

export default conformityMutations;
