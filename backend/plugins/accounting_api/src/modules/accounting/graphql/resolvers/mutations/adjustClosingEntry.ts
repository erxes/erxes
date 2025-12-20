import { IContext } from '~/connectionResolvers';
import { IAdjustClosing } from '~/modules/accounting/@types/adjustClosingEntry';

const adjustClosingEntryMutations = {
  /**
   * Creates a new adjust closing
   */

  async adjustClosingEntriesAdd(
    _root: undefined,
    doc: IAdjustClosing,
    { models }: IContext,
  ) {
    return await models.AdjustClosingEntries.createAdjustClosingEntry(doc);
  },

  /**
   * Edits a adjust closing
   */
  async adjustClosingEntriesEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IAdjustClosing,
    { models }: IContext,
  ) {
    await models.AdjustClosingEntries.getAdjustClosingEntry({ _id });
    return await models.AdjustClosingEntries.updateAdjustClosingEntry(_id, {
      ...doc,
    });
  },

  /**
   * Removes a adjust closing
   */
  async adjustClosingEntriesRemove(
    _root: undefined,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    const response = await models.AdjustClosingEntries.removeAdjustClosing(ids);
    return response;
  },
};

// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesAdd', 'createAdjustClosingEntry');
// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesEdit', 'updateAdjustClosingEntry');
// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesRemove', 'removeAdjustClosing');

export default adjustClosingEntryMutations;
