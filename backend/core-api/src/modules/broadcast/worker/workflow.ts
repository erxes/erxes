import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { IBroadcastRunDocument } from '@/broadcast/db/models/BroadcastRuns';
import { sendAutomationRun } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { drainRun, TDrainDeliver } from './drain';

/**
 * Hands one recipient to the automations service.
 *
 * The manifest freezes who was targeted, never whether they may still be
 * reached: someone who unsubscribed while the run was paused is decided here,
 * not at enrolment. `sent` means dispatched — a flow carrying a delay can run
 * for days afterwards, and what became of it lives in that automation's own
 * history.
 */
const dispatchRecipient = async (
  models: IModels,
  subdomain: string,
  run: IBroadcastRunDocument,
  recipient: IBroadcastRecipientDocument,
  actorId?: string,
) => {
  const customer = await models.Customers.findOne({
    _id: recipient.customerId,
  }).lean();

  if (!customer) {
    return models.BroadcastRecipients.finish(
      recipient._id,
      'missing',
      'customer no longer exists',
    );
  }

  if (customer.isSubscribed && customer.isSubscribed !== 'Yes') {
    return models.BroadcastRecipients.finish(
      recipient._id,
      'skipped',
      'unsubscribed',
    );
  }

  if (
    await models.BroadcastReached.wasReached(
      run.engageMessageId,
      recipient.customerId,
    )
  ) {
    return models.BroadcastRecipients.finish(
      recipient._id,
      'skipped',
      'already sent in an earlier run',
    );
  }

  if (!run.automationId) {
    return models.BroadcastRecipients.finish(
      recipient._id,
      'failed',
      'this run has no workflow',
    );
  }

  try {
    sendAutomationRun(subdomain, {
      automationId: run.automationId,
      target: customer,
      // What a record made by this run came from: the campaign someone
      // configured, and who put it live. The run's own id is stamped on by the
      // automations service, which is the only place it exists.
      createdVia: {
        source: 'broadcast',
        sourceId: run.engageMessageId,
        sourceName: run.method,
        actorId,
      },
    });

    await models.BroadcastRecipients.finish(recipient._id, 'sent');

    // Written down only now. The manifest row this came from may be expired
    // one day; whether this person has been through the flow may not be.
    await models.BroadcastReached.remember(
      run.engageMessageId,
      recipient.customerId,
    );
  } catch (error: any) {
    await models.BroadcastRecipients.finish(
      recipient._id,
      'failed',
      error.message,
    );
  }
};

const deliverWorkflow: TDrainDeliver = async ({
  models,
  subdomain,
  run,
  recipients,
}) => {
  // Whoever put the campaign live, stamped on the automation it owns when the
  // campaign went live. Every record these runs create is created for them.
  const automation = run.automationId
    ? await models.Automations.findOne(
        { _id: run.automationId },
        { updatedBy: 1, createdBy: 1 },
      ).lean()
    : null;
  const actorId = automation?.updatedBy || automation?.createdBy;

  for (const recipient of recipients) {
    await dispatchRecipient(models, subdomain, run, recipient, actorId);
  }
};

export const handleWorkflowProcessor = async (payload: unknown) =>
  drainRun(payload, deliverWorkflow);
