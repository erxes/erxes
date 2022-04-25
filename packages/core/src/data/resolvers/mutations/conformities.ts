import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';
import {
  IConformityAdd,
  IConformityEdit
} from '../../../db/models/definitions/conformities';

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
  async conformityEdit(_root, doc: IConformityEdit, { subdomain, models }: IContext) {
    const { addedTypeIds, removedTypeIds } = await models.Conformities.editConformity({
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
