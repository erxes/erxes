import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';

const adjustmentMutations = {
  adjustmentsAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, messageBroker }
  ) => {
    doc.createdBy = user._id;
    const adjustment = models.Adjustments.createAdjustment(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'adjustment',
        newData: doc,
        object: adjustment,
        extraParams: { models }
      },
      user
    );

    return adjustment;
  },
  /**
   * Updates a adjustment
   */
  adjustmentsEdit: async (
    _root,
    { _id, ...doc },
    { models, checkPermission, user, messageBroker }
  ) => {
    const adjustment = await models.Adjustments.getAdjustment(models, { _id });
    const updated = await models.Adjustments.updateAdjustment(models, _id, doc);

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'adjustment',
        object: adjustment,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes adjustments
   */

  adjustmentsRemove: async (
    _root,
    { adjustmentIds }: { adjustmentIds: string[] },
    { models, checkPermission, user, messageBroker }
  ) => {
    // TODO: contracts check
    const adjustments = await models.Adjustments.find({
      _id: { $in: adjustmentIds }
    }).lean();

    await models.Adjustments.removeAdjustments(models, adjustmentIds);

    for (const adjustment of adjustments) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'adjustment', object: adjustment, extraParams: { models } },
        user
      );
    }

    return adjustmentIds;
  }
};

checkPermission(adjustmentMutations, 'adjustmentsAdd', 'manageContracts');
checkPermission(adjustmentMutations, 'adjustmentsEdit', 'manageContracts');
checkPermission(adjustmentMutations, 'adjustmentsRemove', 'manageContracts');

export default adjustmentMutations;
