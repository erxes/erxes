import { IEngageMessageDocument } from '@/broadcast/@types';
import { sendAutomationRun } from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';

const FAILURE_THRESHOLD = 0.8;

interface WorkflowProcessorPayload {
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  automationId: string;
  customerIds: string[];
}

/**
 * Starts the campaign's workflow once per targeted customer.
 *
 * `successCount` here means dispatched, not finished: a flow carrying a delay
 * or a wait can run for days, so the campaign completes when every customer
 * has been handed to the automations service. What actually happened
 * afterwards lives in that automation's own history and stats.
 */
export const handleWorkflowProcessor = async (payload: unknown) => {
  const { subdomain, engageMessage, automationId, customerIds } =
    payload as WorkflowProcessorPayload;

  const models = await generateModels(subdomain);

  // Whoever put the campaign live, stamped on the automation it owns when the
  // campaign went live. Every record these runs create is created for them.
  const automation = await models.Automations.findOne(
    { _id: automationId },
    { updatedBy: 1, createdBy: 1 },
  ).lean();
  const actorId = automation?.updatedBy || automation?.createdBy;
  const STATS = { successCount: 0, failureCount: 0 };

  try {
    const customers = await models.Customers.find({
      _id: { $in: customerIds },
    }).lean();

    for (const customer of customers) {
      try {
        sendAutomationRun(subdomain, {
          automationId,
          target: customer,
          // What a record made by this run came from: the campaign someone
          // configured, and who put it live. The run's own id is stamped on by
          // the automations service, which is the only place it exists.
          createdVia: {
            source: 'broadcast',
            sourceId: engageMessage._id,
            sourceName: engageMessage.title,
            actorId,
          },
        });

        STATS.successCount++;
      } catch (error: any) {
        STATS.failureCount++;

        await models.BroadcastTraces.createTrace(
          engageMessage._id,
          'failure',
          `Could not start the workflow for customer ${customer._id}: ${error.message}`,
        );
      }
    }

    // Customers that vanished between batching and now still have to be
    // counted, or the campaign never reaches its batch total.
    STATS.failureCount += customerIds.length - customers.length;

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $inc: {
          validCustomersCount: STATS.successCount,
          'progress.processedBatches': 1,
          'progress.successCount': STATS.successCount,
          'progress.failureCount': STATS.failureCount,
        },
        $set: { 'progress.lastUpdated': new Date() },
      },
    );

    const message = await models.EngageMessages.findOne({
      _id: engageMessage._id,
    });

    if (!message) {
      return;
    }

    if (message.progress.processedBatches >= message.progress.totalBatches) {
      const totalProcessed = STATS.successCount + STATS.failureCount;
      const failureRate =
        totalProcessed > 0 ? STATS.failureCount / totalProcessed : 0;
      const finalStatus =
        failureRate >= FAILURE_THRESHOLD ? 'failed' : 'completed';

      await models.EngageMessages.updateOne(
        { _id: engageMessage._id, status: { $eq: 'sending' } },
        { $set: { status: finalStatus } },
      );

      await models.BroadcastTraces.createTrace(
        engageMessage._id,
        finalStatus === 'failed' ? 'failure' : 'success',
        `Campaign ${finalStatus}. Workflow started for ${STATS.successCount} customers, ${STATS.failureCount} could not be started.`,
      );
    }
  } catch (error: any) {
    console.error('Critical error in workflow processor:', error);

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $set: { status: 'failed' },
        $inc: {
          'progress.processedBatches': 1,
          'progress.failureCount': customerIds.length - STATS.successCount,
        },
      },
    );
  }
};
