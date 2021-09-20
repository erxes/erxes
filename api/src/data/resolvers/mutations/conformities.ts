import { Conformities } from '../../../db/models';
import {
  IConformityAdd,
  IConformityEdit
} from '../../../db/models/definitions/conformities';
import { publishHelperItemsConformities } from './boardUtils';

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
    const { addedTypeIds, removedTypeIds } = await Conformities.editConformity({
      ...doc
    });

    const targetTypes = ['deal', 'task', 'ticket'];
    const targetRelTypes = ['company', 'customer'];
    if (
      targetTypes.includes(doc.mainType) &&
      targetRelTypes.includes(doc.relType)
    ) {
      await publishHelperItemsConformities(doc.mainType, doc.mainTypeId);
    }

    if (
      targetTypes.includes(doc.relType) &&
      targetRelTypes.includes(doc.mainType)
    ) {
      for (const typeId of addedTypeIds.concat(removedTypeIds)) {
        await publishHelperItemsConformities(doc.relType, typeId);
      }
    }
  }
};

export default conformityMutations;
