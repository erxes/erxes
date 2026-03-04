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

  async adjustClosingRun(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const closing = await models.AdjustClosingEntries.findById(_id).lean();
    if (!closing) throw new Error('Adjust Closing not found');

    if (closing.status !== 'draft') {
      throw new Error('Only draft Adjust Closing can be run');
    }

    const details = await models.AdjustClosingEntries.getAdjustClosingEntries({
      beginDate: closing.beginDate,
      date: closing.date,
    });

    const updated = await models.AdjustClosingEntries.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: 'complete',
          entries: details,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    return updated;
  },
};

// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesAdd', 'createAdjustClosingEntry');
// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesEdit', 'updateAdjustClosingEntry');
// checkPermission(adjustClosingEntryMutationsMutations, 'adjustClosingEntriesRemove', 'removeAdjustClosing');

export default adjustClosingEntryMutations;
