import { IUom } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const uomMutations = {
  /**
   * Creates a new uom
   * @param {Object} doc uom document
   */
  async uomsAdd(_parent: undefined, doc: IUom, { models }: IContext) {
    return await models.Uoms.createUom(doc);
  },

  /**
   * Edits a uom
   * @param {string} param2._id uom id
   * @param {Object} param2.doc uom info
   */
  async uomsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IUom,
    { models }: IContext,
  ) {
    return await models.Uoms.updateUom(_id, doc);
  },

  /**
   * Removes a uom
   * @param {string[]} uomIds Array of Uom ids
   */
  async uomsRemove(
    _parent: undefined,
    { uomIds }: { uomIds: string[] },
    { models }: IContext,
  ) {
    return await models.Uoms.removeUoms(uomIds);
  },
};
