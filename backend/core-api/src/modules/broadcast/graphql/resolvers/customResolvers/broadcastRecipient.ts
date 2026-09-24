import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { IContext } from '~/connectionResolvers';

export default {
  /**
   * The manifest keeps only the id, so a row for someone deleted since still
   * reads — it resolves to nothing, and the row's own `missing` status is what
   * explains why.
   */
  async customer(
    { customerId }: IBroadcastRecipientDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Customers.findOne({ _id: customerId });
  },

  /**
   * The flow this recipient's dispatch started, once the automations service
   * has created it. There is a moment after dispatch where it does not exist
   * yet, and rows that were never dispatched never get one at all.
   */
  async execution(
    { automationId, customerId, runId }: IBroadcastRecipientDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    // Rows written before the id was carried on the row still resolve.
    const resolvedAutomationId =
      automationId ||
      (
        await models.BroadcastRuns.findOne(
          { _id: runId },
          { automationId: 1 },
        ).lean()
      )?.automationId;

    if (!resolvedAutomationId) {
      return null;
    }

    return models.AutomationExecutions.findOne({
      automationId: resolvedAutomationId,
      targetId: customerId,
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};
