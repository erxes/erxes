import { IContext } from '~/connectionResolvers';
import { IAdjustClosing } from '~/modules/accounting/@types/adjustClosingEntry';

const adjustClosingEntryMutations = {
  /**
   * Creates a new adjust closing
   */

  async adjustClosingAdd(
    _root: undefined,
    doc: IAdjustClosing,
    { models }: IContext,
  ) {
    return await models.AdjustClosings.createAdjustClosing(doc);
  },

  /**
   * Edits a adjust closing
   */
  async adjustClosingEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IAdjustClosing,
    { models }: IContext,
  ) {
    await models.AdjustClosings.getAdjustClosing({ _id });
    return await models.AdjustClosings.updateAdjustClosing(_id, {
      ...doc,
    });
  },

  /**
   * Removes a adjust closing
   */
  async adjustClosingRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const response = await models.AdjustClosings.removeAdjustClosing(_id);
    return response;
  },

  async adjustClosingRun(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const closing = await models.AdjustClosings.findById(_id).lean();
    if (!closing) throw new Error('Adjust Closing not found');

    if (closing.status !== 'draft') {
      throw new Error('Only draft Adjust Closing can be run');
    }

    const details = await models.AdjustClosings.getAdjustClosings({
      beginDate: closing.beginDate,
      date: closing.date,
    });

    const updated = await models.AdjustClosings.findByIdAndUpdate(
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
