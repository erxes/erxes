import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  IPurpose,
  IPurposeDocument
} from '../../../models/definitions/loanPurpose';

const purposeMutations = {
  purposeAdd: async (_root, doc: IPurpose, { models }: IContext) => {
    if (!doc.code) {
      throw new Error('must choose code');
    }

    const purpose = await models.LoanPurpose.createPurpose(doc);

    return purpose;
  },
  /**
   * Updates a purpose
   */

  purposeEdit: async (
    _root,
    { _id, ...doc }: IPurposeDocument,
    { models }: IContext
  ) => {
    if (!doc.code) {
      throw new Error('must choose code');
    }

    const updated = await models.LoanPurpose.updatePurpose(_id, doc);

    return updated;
  },

  /**
   * Removes purposes
   */

  purposesRemove: async (
    _root,
    { purposeIds }: { purposeIds: string[] },
    { models }: IContext
  ) => {
    await models.LoanPurpose.removePurposes(purposeIds);

    return purposeIds;
  }
};

checkPermission(purposeMutations, 'purposeAdd', 'managePurpose');
checkPermission(purposeMutations, 'purposeEdit', 'managePurpose');
checkPermission(purposeMutations, 'purposesRemove', 'managePurpose');

export default purposeMutations;
